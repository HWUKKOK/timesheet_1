//===== logout =====
let logout_btn = document.getElementById("logout-btn");

logout_btn.addEventListener('click', function(e){
    e.preventDefault();
    location.replace("index.html");
});


//======= dummy data =========
let weekly_tasks = [
    {task_no:1, date:"2021-06-10", time_start:"08:00", time_end:"17:00", duration:540, task_desc:"Create user interface"},
    {task_no:2, date:"2021-06-11", time_start:"08:00", time_end:"17:00", duration:540, task_desc:"Create login-logout feature"},
    {task_no:3, date:"2021-06-12", time_start:"08:00", time_end:"17:00", duration:540, task_desc:"Create database system"},
    {task_no:4, date:"2021-06-13", time_start:"08:00", time_end:"17:00", duration:540, task_desc:"Create admin interface"},
    {task_no:5, date:"2021-06-14", time_start:"08:00", time_end:"17:00", duration:540, task_desc:"Create account interface"}
];


//======== initialized weekly timesheet table =======
task_loader(weekly_tasks);

//======== create billing DB & table =======
// create_billing_db_table();


//===== initialize table with data from database =====
function task_loader(taskArr){  
    
    // clear all the road first
    clear_all_table_row();

    // load only if there is task in the taskArr
    if(taskArr.length !== 0){
        
        // prepare data for new table row
        var init_duration = sum_duration(taskArr);
        var timesheetTable = document.getElementById("timesheet-table");
        var targetRowPos = 1;
        var closeTag = '<button onclick="delete_row(this)" type="button" class="btn-close" aria-label="Close"></button>';

        // array loop for new row tr
        for(let taskObj of taskArr){
        var row = timesheetTable.insertRow(targetRowPos);

            // single object loop for new td
            for(key in taskObj){
                var cell_no = row.insertCell();
                cell_no.innerHTML = taskObj[key];
            }// object loop    
            
            var cell_no = row.insertCell();
                cell_no.innerHTML = closeTag;
                targetRowPos++;
        }// array loop

        // update total duration
        var format_duration = time_format(init_duration);
        var format_remain_duration = (init_duration < 2400) ? time_format(2400 - init_duration) : time_format(0);

        // add completion duration result and submit button
        if(init_duration > 0 && init_duration < 2400){
            document.getElementById('total-time-completion').innerHTML = "Total Completed Duration: " + format_duration + "   |   Remaining Minimum Hour Before Submission: " + format_remain_duration;
        }

        if(init_duration >= 2400){
            document.getElementById('total-time-completion').innerHTML = "Total Completed Duration: " + format_duration + "   |   Remaining Minimum Hour Before Submission: " + format_remain_duration;
            document.getElementById('submit_btn').innerHTML = '<button onclick="submit_task()" type="button" class="btn bg-white text-green">Submit</button>';
        }
        
    }// end if

}// task loader function



//====== add task into weekly timesheet table ======
document.getElementById("add_task").addEventListener("click", function(event){
    event.preventDefault();
    var date_info = document.getElementById("working_date").value;
    var start_info = document.getElementById("time_start").value;
    var end_info = document.getElementById("time_end").value;
    var task_info = document.getElementById("task_desc").value;
    var closeTag = '<button onclick="delete_row(this)" type="button" class="btn-close" aria-label="Close"></button>';
    var duration_info = durationCalc(start_info,end_info);
   
    // prepare data for new table row
    var timesheetTable = document.getElementById("timesheet-table");
    var countRow = timesheetTable.rows.length;
    var targetRowPos = countRow - 2;
    var row = timesheetTable.insertRow(targetRowPos);

    var cell_no = row.insertCell(0);
    cell_no.innerHTML = targetRowPos;

    var cell_date = row.insertCell(1);
    cell_date.innerHTML = date_info;

    var cell_start = row.insertCell(2);
    cell_start.innerHTML = start_info;

    var cell_end = row.insertCell(3);
    cell_end.innerHTML = end_info;

    var cell_duration = row.insertCell(4);
    cell_duration.innerHTML = duration_info;

    var cell_task = row.insertCell(5);
    cell_task.innerHTML = task_info;

    var cell_close = row.insertCell(6);
    cell_close.innerHTML = closeTag;

    // create key value pair object
    let new_obj = {task_no:targetRowPos, date:date_info, time_start:start_info, time_end:end_info, duration:duration_info, task_desc:task_info};
    
    // update total duration
    update_data(weekly_tasks, duration_info, new_obj);

});


//====== update ======
function update_data(weeklytasks = [], newduration = 0, newobj = {}){
    var init_duration = sum_duration(weeklytasks);
    var new_duration = init_duration + newduration;
    var format_duration = time_format(new_duration);
    var format_remain_duration = (new_duration < 2400) ? time_format(2400 - new_duration) : time_format(0);

    // update weeklytasks array 
    if(newobj.length !== 0){
        weeklytasks.push(newobj);
    }
    
    // add completion duration result and submit button
    if(new_duration > 0 && new_duration < 2400){
        document.getElementById('total-time-completion').innerHTML = "Total Completion Duration: " + format_duration + "   |   Remaining Minimum Hour Before Submission: " + format_remain_duration;
    }

    if(new_duration >= 2400){
        document.getElementById('total-time-completion').innerHTML = "Total Completion Duration: " + format_duration + "   |   Remaining Minimum Hour Before Submission: " + format_remain_duration;
        document.getElementById('submit_btn').innerHTML = '<button onclick="submit_task()" type="button" class="btn bg-white text-green">Submit</button>';
    }
}


//====== delete row used for closeTag ======
function delete_row(r){
    var i = r.parentNode.parentNode.rowIndex;
    // document.getElementById("timesheet-table").deleteRow(i);
    
    // delete targeted object in the weekly_tasks
    weekly_tasks.splice(i-1,1);

    // reassigned task_no in all the objects
    reassigned_task_no(weekly_tasks);

    // reload table
    task_loader(weekly_tasks);

}


//====== reassign task no  ======
function reassigned_task_no(arr){
    let total_task = arr.length;
    if(total_task !== 0){
        let b = 1;
        for(let task of arr){
            task['task_no'] = b;
            b++;
        }
    }
}


//====== clear all table ======
function clear_all_table_row(){
    var timesheetTable = document.getElementById("timesheet-table");
    var totalRow = timesheetTable.rows.length;
    var endRow = totalRow - 3;
    
    for(let a = 0; a < endRow ; a++){
        timesheetTable.deleteRow(1);
    }

    document.getElementById('total-time-completion').innerHTML = "Total Completed Duration: 0 Hour 0 minutes   |   Remaining Minimum Hour Before Submission: 40 Hour 0 minutes";
    document.getElementById('submit_btn').innerHTML = '';
}



//===== duration calculation function =====
// input argument format must be string 'h1h2:m1m2'
function durationCalc(start, end){

    // check time format using regular expression (optional)
    let regex = /[0-2][0-9]:[0-5][0-9]/;

    if(regex.test(start) && regex.test(end)){
    
    // convert string to array
    let startArr = start.split("");
    let endArr = end.split("");
    
    // remove ":" symbol from the array
    startArr.splice(2,1);
    endArr.splice(2,1);
    
    // get time duration
    let start_time = convert_arr_to_minutes_before_sum(startArr);
    let end_time = convert_arr_to_minutes_before_sum(endArr);
    
    let duration = end_time - start_time;
    
    // return duration in minutes format
    return duration;

    }else{
        console.log("Invalid time format!");
        return;
    }
    
    //======= nested function ======
    function convert_arr_to_minutes_before_sum(arr){
        
        let intArr = arr.map(a => {return parseInt(a)});   
        let sumTime = intArr[0] * 600 + intArr[1] * 60 + intArr[2] * 10 + intArr[3];
        return sumTime;
        }  
}// durationCalc function
    


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


//==== get current date ====
function today_date(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();
    
    if(dd<10) { dd='0'+dd; } 
    if(mm<10) { mm='0'+mm; } 
    today = dd+'-'+mm+'-'+yyyy;
    return today;
}


// create billing db table
// function create_billing_db_table(){
//     var db_bil;
//     var request = window.indexedDB.open("task_billing", 1);

//     request.onerror = function(event) {
//     console.log("error: ");
//     };

//     request.onsuccess = function(event) {
//     db_bil = request.result;
//     console.log("success: open"+ db_bil);
//     };

//     // initialized indexedDB table
//     request.onupgradeneeded = function(event) {
//         var db_bil = event.target.result;
        
//         let objectStore = db_bil.createObjectStore("billing_table", {keyPath: "key", autoIncrement: true});

//         // createindex: 1) field name 2) keypath 3) options
//         objectStore.createIndex('submission_list', 'submission_list', { unique: false } );

//         console.log("billing table successfully created");    
//     }
// }



//====== submit the weekly task for approval using indexedDB ======
function submit_task(){
    let approval_record = weekly_tasks.map(function(obj){return obj});
    weekly_tasks = [];

    task_loader(weekly_tasks);


    //===== initialized indexedDB =====
    var db;
    var request = window.indexedDB.open("weeklytimesheet", 1);

    request.onerror = function(event) {
    console.log("error: ");
    };

    request.onsuccess = function(event) {
    db = request.result;
    console.log("success: open"+ db);
    };

    // initialized indexedDB table
    request.onupgradeneeded = function(event) {
        var db = event.target.result;
        
        let objectStore = db.createObjectStore("timesheet_table", {keyPath: "key", autoIncrement: true});

        // createindex: 1) field name 2) keypath 3) options
        objectStore.createIndex('submission_list', 'submission_list', { unique: false } );

        console.log("Object store successfully created");    
    }


    // save approval_record into indexedDB
    let str_data = JSON.stringify(approval_record);
    let week_obj = {date:today_date(), submission_list:str_data};

        setTimeout(function(){
        console.log(week_obj);
            add(week_obj);
        }, 2000);


    //====== add fucntion ======
    function add(wk_obj) {
        var request = db.transaction("timesheet_table", "readwrite")
        .objectStore("timesheet_table")
        .add(wk_obj);
        
        request.onsuccess = function(event) {
            console.log("Submission list has been added to your database.");
        };
        
        request.onerror = function(event) {
            console.log("Unable to add new submission list as it is already exist in your database! ");
        }
    }// add function     

    
} // submit button



