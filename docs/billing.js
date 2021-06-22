
//===== logout =====
let billing_logout_btn = document.getElementById("billing-logout-btn");

billing_logout_btn.addEventListener('click', function(e){
    e.preventDefault();
    location.replace("index.html");
});


let weekly_tasks_approval;
let list_key;

//======= load submission list data =========
var db;
var request = window.indexedDB.open("task_billing", 1);

request.onerror = function(event) {
   console.log("error: ");
};

request.onsuccess = function(event) {
   db = request.result;
   console.log("success: "+ db);
};



//====== load submission list function ======
function load_approved_list(){
    // create the object store
    let objectStore = db.transaction('billing_table').objectStore('billing_table');
 
    objectStore.openCursor().onsuccess = function(e) {
       // assign the current cursor
       let cursor = e.target.result;
 
       if(cursor) {                             
             let new_submitted_arr = JSON.parse(cursor.value.submission_list);
                 weekly_tasks_approval = new_submitted_arr;
                 list_key = cursor.value.key;
       } else {        
             console.log('No results Found');
       }// end else
    }// openCursor onsuccess
 
 }// load submission
 


 //==== execute read function ====
 setTimeout(function(){
 
     load_approved_list();
         
     setTimeout(function(){
         task_loader_billing(weekly_tasks_approval);
     }, 500);
 
 }, 500);



 //===== initialize table with data from database =====
function task_loader_billing(taskArr){  

    // load only if there is task in the taskArr
    if(taskArr.length !== 0){
        
        // prepare data for new table row
        var init_duration = sum_duration(taskArr);
        var timesheetTable = document.getElementById("timesheet-table-approval");
        var targetRowPos = 1;

        // array loop for new row tr
        for(let taskObj of taskArr){
        var row = timesheetTable.insertRow(targetRowPos);
            // single object loop for new td
            for(key in taskObj){
                var cell_no = row.insertCell();
                cell_no.innerHTML = taskObj[key];
            }// object loop    
        }// array loop

        // update total duration
        var format_duration = time_format(init_duration);
        document.getElementById('total-time-completion-approval').innerHTML = "Total Completed Duration: " + format_duration;       

    }// end if

}// task loader approval



//===== format time from minutes to hour-minutes =====
function time_format(t_in_minutes){
    var hour = Math.floor(t_in_minutes/60);
    var minutes = t_in_minutes - hour * 60;

    return hour + ' Hour ' + minutes + ' minutes';
}    



//====== sum up total duration from given array =====
function sum_duration(taskArr){

    let total_duration = 0; 
    for(let taskObj of taskArr){
        total_duration += taskObj['duration'];
    }
    return total_duration;
}