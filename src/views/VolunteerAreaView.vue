<template>
 <div class="container-fluid mt-4">
  <div class="row">
   <!-- Left Sidebar -->
   <div class="col-md-3 mb-3">
    <div class="list-group">
     <button class="list-group-item list-group-item-action" :class="{ active: currentTab === 'notice' }" @click="currentTab = 'notice'">
      📢 Volunteer Guidelines
     </button>
     <button class="list-group-item list-group-item-action" :class="{ active: currentTab === 'register' }" @click="currentTab = 'register'">
      📋 Register for Volunteer Activities
     </button>
    </div>
   </div>

   <!-- Right Content Area -->
   <div class="col-md-9">
    <div v-if="currentTab === 'notice'">
     <h4>📢 Volunteer Guidelines</h4>
     <ul>
      <li>📧 If you can't attend an event, please email us in advance.</li>
      <li>📄 Contact the admin for official volunteer hour certificates.</li>
      <li>⏰ Volunteer hours are automatically tracked in your account.</li>
     </ul>
    </div>

    <!-- 【升级】Register Tab，学习 Elder 版本，使用 DataTable -->
    <div v-if="currentTab === 'register'">
     <h4>📋 Volunteer Activity Registration</h4>
     <p class="text-muted">Select the volunteer activities you're interested in.</p>
     
     <DataTable
        v-if="!isLoading"
        :columns="columns"
        :data="activities"
        :options="dtOptions"
        class="table table-hover table-striped"
        style="width:100%"
        @select="handleRowSelect"
        @deselect="handleRowSelect"
      >
        <thead>
          <tr>
            <th>Select</th>
            <th>Activity</th>
            <th>Details</th>
            <th>Availability</th>
            <th>Status</th>
          </tr>
        </thead>
      </DataTable>
      <p v-else>Loading activities...</p>

      <button class="btn btn-primary mt-3" @click="submitRegistrations" :disabled="selectedActivities.length === 0">
        Submit Registration ({{ selectedActivities.length }})
     </button>
    </div>
   </div>
  </div>
 </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

// 【学习 Elder 版本】引入 DataTable 相关库
import DataTable from 'datatables.net-vue3';
import DataTablesCore from 'datatables.net-bs5';
import DataTablesSelect from 'datatables.net-select-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import 'datatables.net-select-bs5/css/select.bootstrap5.min.css';
DataTable.use(DataTablesCore);
DataTable.use(DataTablesSelect);

// 【学习 Elder 版本】引入 Firebase 相关库
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/firebase/config';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';

const router = useRouter();
const auth = getAuth();

// --- State refs (与 Elder 版本类似) ---
const currentTab = ref('notice');
const activities = ref([]);
const selectedActivities = ref([]);
const successMessage = ref('');
const userUID = ref(null);
const isLoading = ref(true);

// --- DataTable Config (学习 Elder 版本，并加入 Volunteer 逻辑) ---
const columns = [
  { data: null, defaultContent: '', orderable: false, className: 'select-checkbox' },
  { data: 'title', title: 'Activity' },
  { 
    data: null,
    title: 'Details',
    render: (data, type, row) => `${row.date} ${row.time} @ ${row.location}`
  },
  { 
    data: null,
    title: 'Availability',
    render: (data, type, row) => `Needed: ${row.capacity} | Registered: ${row.registeredVolunteers ? row.registeredVolunteers.length : 0}`
  },
  { 
    data: null,
    title: 'Status',
    // 【关键】在 render 函数中嵌入 Volunteer 的业务逻辑
    render: (data, type, row) => {
      if (hasJoined(row)) return '<span class="text-success">✅ Already registered</span>';
      if (isFull(row)) return '<span class="text-danger">⛔ Full</span>';
      if (isConflict(row)) return '<span class="text-danger">⛔ Time conflict</span>'; // 注意：这里的冲突检测是基于已选中的行
      return '<span class="text-info">Available</span>';
    }
  },
];

const dtOptions = {
  responsive: true,
  pageLength: 10,
  searching: true,
  ordering: true,
  select: { style: 'multi', selector: 'td:first-child' },
  // 【关键】根据行数据决定是否可选，嵌入 Volunteer 的业务逻辑
  rowCallback: (row, data) => {
    if (isFull(data) || hasJoined(data) || isConflict(data)) {
      row.classList.add('dt-row-disabled');
    } else {
      row.classList.remove('dt-row-disabled');
    }
  }
};

// 【学习 Elder 版本】使用 onAuthStateChanged 加载数据
onMounted(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      userUID.value = user.uid;
      const querySnapshot = await getDocs(collection(db, 'volunteer_activities'));
      activities.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      isLoading.value = false;
    } else {
      router.push('/login');
    }
    unsubscribe();
  });
});

// --- Volunteer 独有的业务逻辑 (适配 Firebase) ---
function isFull(activity) {
  return activity.registeredVolunteers && activity.registeredVolunteers.length >= activity.capacity;
}

function hasJoined(activity) {
  return activity.registeredVolunteers && activity.registeredVolunteers.includes(userUID.value);
}

function isConflict(newAct) {
  if (!userUID.value) return false;
  
  // 检查与【已报名】活动的冲突
  const currentUserActivities = activities.value.filter(a => 
    a.registeredVolunteers && a.registeredVolunteers.includes(userUID.value)
  );
  
  // 检查与【当前选择】活动的冲突
  const currentlySelectedActivities = activities.value.filter(a => 
    selectedActivities.value.includes(a.id) && a.id !== newAct.id
  );
  
  // 合并两个列表进行冲突检查
  const allUserActivities = [...currentUserActivities, ...currentlySelectedActivities];
  
  return allUserActivities.some(a => a.date === newAct.date && a.time === newAct.time);
}

// 【学习 Elder 版本】DataTable 事件处理
function handleRowSelect(e, dt, type, indexes) {
  const selectedRowsData = dt.rows({ selected: true }).data().toArray();
  
  // 检查新选择的活动是否有时间冲突
  const validSelections = [];
  for (const row of selectedRowsData) {
    // 临时设置选择列表来检查冲突
    const tempSelected = validSelections.map(r => r.id);
    selectedActivities.value = tempSelected;
    
    if (isConflict(row)) {
      // 如果有冲突，取消选择这一行
      const rowIndex = dt.row((idx, data) => data.id === row.id).index();
      dt.row(rowIndex).deselect();
      alert(`Cannot select "${row.title}" due to time conflict with other selected activities.`);
    } else {
      validSelections.push(row);
    }
  }
  
  selectedActivities.value = validSelections.map(row => row.id);
  console.log('Selected activities:', selectedActivities.value);
}

// 【学习 Elder 版本】提交逻辑
async function submitRegistrations() {
  if (!userUID.value || selectedActivities.value.length === 0) return;

  const promises = [];
  
  // 再次检查时间冲突和容量
  for (const id of selectedActivities.value) {
    const act = activities.value.find(a => a.id === id);
    if (isConflict(act) || isFull(act) || hasJoined(act)) {
       alert(`Cannot register for "${act.title}" due to a conflict or it being full.`);
       return;
    }
    const activityRef = doc(db, 'volunteer_activities', id);
    promises.push(
      updateDoc(activityRef, {
        registeredVolunteers: arrayUnion(userUID.value)
      })
    );
  }

  try {
    await Promise.all(promises);

    successMessage.value = 'Successfully registered!';
    
    // 刷新数据以更新 UI
    isLoading.value = true;
    const querySnapshot = await getDocs(collection(db, 'volunteer_activities'));
    activities.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    isLoading.value = false;
    selectedActivities.value = [];

  } catch (error) {
    console.error("Error submitting registrations:", error);
    successMessage.value = 'An error occurred during registration.';
  }

  setTimeout(() => (successMessage.value = ''), 4000);
}
</script>

<style scoped>
.list-group-item {
  border-radius: 8px;
  margin-bottom: 8px;
}

/* DataTable disabled row styling */
:deep(.dt-row-disabled) {
  background-color: #f8f9fa !important;
  opacity: 0.6;
  pointer-events: none;
}

:deep(.dt-row-disabled td) {
  color: #6c757d !important;
}

/* DataTable select checkbox styling */
:deep(.select-checkbox) {
  text-align: center;
  width: 40px;
}

:deep(.select-checkbox:before) {
  content: '';
  margin-top: 0;
  margin-left: 0;
}
</style>