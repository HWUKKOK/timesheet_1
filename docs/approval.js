//===== logout =====
let approval_logout_btn = document.getElementById("approval-logout-btn");

approval_logout_btn.addEventListener('click', function(e){
    e.preventDefault();
    location.replace("index.html");
});


// ==== checkbox =====
function check_approval() {
    const checkboxes = document.querySelectorAll('input[name="task-approved"]:checked');
    let sum_duration = 0;
    checkboxes.forEach((checkbox) => {
        sum_duration += parseInt(checkbox.value);
    });

    // update total duration
    var format_duration = time_format(sum_duration);

    document.getElementById('total-time-completion-approval').innerHTML = "Total Approved Tasks Duration: " + format_duration; 
}


//======= dummy data =========
// let weekly_tasks_approval = [
//     {task_no:1, date:"2021-06-10", time_start:"08:00", time_end:"17:00", duration:1300, task_desc:"Create user interface"},
//     {task_no:2, date:"2021-06-11", time_start:"08:00", time_end:"17:00", duration:540, task_desc:"Create login"},
//     {task_no:3, date:"2021-06-12", time_start:"08:00", time_end:"17:00", duration:540, task_desc:"Create user interface"},
//     {task_no:4, date:"2021-06-12", time_start:"08:00", time_end:"17:00", duration:540, task_desc:"Create user interface"}
// ];


let weekly_tasks_approval;
let list_key;

//======= load submission list data =========
var db;
var request = window.indexedDB.open("weeklytimesheet", 1);

request.onerror = function(event) {
   console.log("error: ");
};

request.onsuccess = function(event) {
   db = request.result;
   console.log("success: "+ db);
};


//====== load submission list function ======
function load_submission(){
   // create the object store
   let objectStore = db.transaction('timesheet_table').objectStore('timesheet_table');

   objectStore.openCursor().onsuccess = function(e) {
      // assign the current cursor
      let cursor = e.target.result;

      if(cursor) { 
                             
            let new_submitted_arr = JSON.parse(cursor.value.submission_list);
                // console.log(new_submitted_arr);
                weekly_tasks_approval = new_submitted_arr;
                list_key = cursor.value.key;
                console.log(list_key);       
            // cursor.continue();
      } else {        
            console.log('No results Found');
      }// end else
   }// openCursor onsuccess

}// load submission

//==== execute read function ====
setTimeout(function(){

    load_submission();
        
    setTimeout(function(){
        task_loader_approval(weekly_tasks_approval);
    },1000);

}, 1000);



// task_loader_approval(weekly_tasks_approval);

//===== initialize table with data from database =====
function task_loader_approval(taskArr = []){  
    
    // clear all the row first
    // clear_all_table_row();

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
            
            var cell_no = row.insertCell();
                cell_no.innerHTML = `<td class="text-center"><input id=${taskObj["task_no"]} onclick="check_approval()" class="form-check-input" type="checkbox" value=${taskObj["duration"]} name="task-approved"></td>`;
                targetRowPos++;
        }// array loop

        // update total duration
        var format_duration = time_format(init_duration);

        document.getElementById('total-time-completion-approval').innerHTML = "Total Tasks Duration To Be Approved: " + format_duration;       

    }// end if

}// task loader approval


// for billing purposes
let confirm_approval_arr = [];

// ==== confirm approval =====
function confirm_approval() {
    const checkboxes = document.querySelectorAll('input[name="task-approved"]:checked');
    
    checkboxes.forEach((checkbox)=>{
        
        for(let t_obj of weekly_tasks_approval){
            if(t_obj['task_no'] == checkbox.id){
                confirm_approval_arr.push(t_obj);
            }
        } 
    });// forEach loop

    // save approved task into indexedDB for billing
    save_approve_task();  

    // delete previous record in indexedDB
    delete_prev_record(list_key);

    // reload table
    clear_all_table_row();

}// confirm_approval function



//==== save the approved task into indexedDB ====
function save_approve_task(){
    var db_bil;
    var request = window.indexedDB.open("task_billing", 1);

    request.onerror = function(event) {
    console.log("error: ");
    };

    request.onsuccess = function(event) {
    db_bil = request.result;
    console.log("success: open"+ db_bil);
    };

    // initialized indexedDB table
    request.onupgradeneeded = function(event) {
        var db_bil = event.target.result;
        
        let objectStore = db_bil.createObjectStore("billing_table", {keyPath: "key", autoIncrement: true});

        // createindex: 1) field name 2) keypath 3) options
        objectStore.createIndex('submission_list', 'submission_list', { unique: false } );

        console.log("billing table successfully created");    
    }


    // save approval_record into indexedDB
    let str_data = JSON.stringify(confirm_approval_arr);
    let week_obj = {date:today_date(), submission_list:str_data};

        setTimeout(function(){
        add_to_bill(week_obj);
        }, 2000);


    //====== add fucntion ======
    function add_to_bill(wek_obj) {
        var request = db_bil.transaction("billing_table", "readwrite")
        .objectStore("billing_table")
        .add(wek_obj);
        
        request.onsuccess = function(event) {
            console.log("Billing list has been added to your database.");
        };
        
        request.onerror = function(event) {
            console.log("Unable to add new billing list as it is already exist in your database! ");
        }
    }// add_to_bill function 

}// save_approved_task function



function delete_prev_record(id){
    
        let recordID = Number(id);
        
        // use a transaction
        let transaction = db.transaction(['timesheet_table'], 'readwrite');
        let objectStore = transaction.objectStore('timesheet_table');
        objectStore.delete(recordID);

        transaction.onerror = () => {
            console.log("Remove previous record error")
        }
        
        transaction.oncomplete = () => {
             console.log("Remove previous record completed")
        }
   
}// delete_prev_record function


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

}// durationCalc
    


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
    var timesheetTable = document.getElementById("timesheet-table-approval");
    var totalRow = timesheetTable.rows.length;
    var endRow = totalRow - 3;
    
    for(let a = 0; a < endRow ; a++){
        timesheetTable.deleteRow(1);
    }

    document.getElementById('total-time-completion-approval').innerHTML = "Total Completion Duration: 0 Hour 0 minutes";
    document.getElementById('last-row').innerHTML = "<p>Approval successfully submitted</p>";
}