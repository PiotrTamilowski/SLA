// SELECTORS
const wrapper = document.querySelector("div#wrapper");
const settingsImage = document.querySelector("img#settings");
const errorMessage = document.querySelector("h2#error");
const ticketNo = document.querySelector("input#ticketNo");
const dateInput = document.querySelector("input#ticketDateTime");
const ticketPriority = document.querySelector("select#ticketPriority");
const project = document.querySelector("select#project");
const addButton = document.querySelector("button#addButton");
const ticketsTableBody = document.querySelector("#ticketsTable tbody");
const popup = document.querySelector("div#popup")
const slaTableBody = document.querySelector("#slaList tbody");
const saveSLAButton = document.querySelector("button#saveSLA");
const addProjectButton = document.querySelector("button#addProject")

// VARIABLES
const currentDateTime = new Date();
let ticketsArray = [];
let slaArray = [];

 //SLA ARRAY
 slaArray = [
    {
        name: "Project1",
        P1: 4,
        P2: 24,
        P3: 72,
        P4: 120
    },
    {
        name: "Project2",
        P1: 4,
        P2: 6,
        P3: 120,
        P4: 720
    },
    {
        name: "Project3",
        P1: 4,
        P2: 48,
        P3: 120,
        P4: 240
    },
    {
        name: "Project4",
        P1: 1,
        P2: 12,
        P3: 24,
        P4: 48
    },
]


//INIT
Notification.requestPermission();      
getTicketsFromCookies()
getProjectsFromSlaArray()
getSlaFromCookies()
addAndAppendSla()
setRemainingTime()


dateInput.value = `${currentDateTime.getFullYear()}-${(currentDateTime.getMonth()+1) < 10 ? "0" + (currentDateTime.getMonth()+1): (currentDateTime.getMonth()+1)}-${currentDateTime.getDate() < 10 ? "0"+currentDateTime.getDate() : currentDateTime.getDate()} ${currentDateTime.getHours() < 10 ? "0" + currentDateTime.getHours() : currentDateTime.getHours()}:${currentDateTime.getMinutes() < 10 ? "0" + currentDateTime.getMinutes() : currentDateTime.getMinutes()}`

addButton.addEventListener("click", function(e){
    e.preventDefault();
    addTicket();
})

addProjectButton.addEventListener("click", addProject);

function addTicket(){
    let doesTicketNoExists = false;
    ticketsArray.forEach((obj) => {
        if(obj.ticketNo === ticketNo.value && ticketNo.value != ""){
            errorMessage.textContent = "Error: This ticket number already exists!";
            doesTicketNoExists = true;
            return;
        }
    })
    if(ticketNo.value === ""){
        errorMessage.textContent = "Error: Ticket number cannot be empty!"
    } else if(ticketNo.value <= 0){
        errorMessage.textContent = "Error: Ticket number cannot be less than or equal to 0!"
    } else if(!doesTicketNoExists && project.value === ""){
        errorMessage.textContent = "Error: Project has not been selected!";
    } else if(!doesTicketNoExists && ticketPriority.value === ""){
        errorMessage.textContent = "Error: Priority has not been selected!";
    } else if(dateInput.value === ""){
        errorMessage.textContent = "Error: Incorrect date format";
    } else if(new Date(dateInput.value).getTime() > new Date().getTime()){
        errorMessage.textContent = "Error: Are you a time traveler O_o? The ticket creation date cannot be later than the current date";
    } else if(!doesTicketNoExists) {
        errorMessage.textContent = "";
        startDate = new Date(dateInput.value)
        
        // INFORMATION FROM THE TICKET IS PUSHED TO TICKETSARRAY AS OBJECT
        ticketsArray.push({
            ticketNo: ticketNo.value,
            startDate: `${startDate.getFullYear()}-${(startDate.getMonth()+1) < 10 ? "0" + (startDate.getMonth()+1): (startDate.getMonth()+1)}-${startDate.getDate() < 10 ? "0"+startDate.getDate() : startDate.getDate()} ${startDate.getHours() < 10 ? "0" + startDate.getHours() : startDate.getHours()}:${startDate.getMinutes() < 10 ? "0" + startDate.getMinutes() : startDate.getMinutes()}`,
            ticketPriority: ticketPriority.value,
            project: project.value
        })

        setDeadline(ticketsArray[ticketsArray.length-1].project, ticketsArray[ticketsArray.length-1]["ticketPriority"])
        addAndAppendTickets(ticketsArray.length-1)
        setRemainingTime();
        addCookie();
        
        // INPUT FIELDS RESET
        ticketNo.value = ""
        ticketPriority.value = ""
        project.value = "";

    }
}

function removeTicket(){
    ticketsArray.splice(this.getAttribute("data-id"), 1)
    ticketsTableBody.textContent = ""

    // TABLE IS CLEARED AND CREATED FROM 0 WITH NEW DATA-ID VALUES ASSIGNED TO DELETE BUTTONS
    if(ticketsArray.length > 0){
        for(let i = 0; i < ticketsArray.length; i++){
            addAndAppendTickets(i)
        }
        setRemainingTime();
    }
    // THE COOKIES ARE ALSO DELETED FROM THE BROWSER AND ADDED TO THE BROWSER
    document.cookie = '{}; expires=Thu, 18 Dec 1970 12:00:00 UTC'
    addCookie();
}

function addAndAppendTickets(index){
    const tr = document.createElement("tr");
    const tdTicketNo = document.createElement("td");
    const tdProject = document.createElement("td");
    const tdPriority = document.createElement("td");
    const tdCreatedOn = document.createElement("td");
    const tdDeadline = document.createElement("td");
    const tdRemainingTime = document.createElement("td")
    const tdRemove = document.createElement("td");
    const tdRemoveButton = document.createElement("button")
    
    tdTicketNo.textContent = ticketsArray[index].ticketNo;
    tdProject.textContent = ticketsArray[index].project;
    tdPriority.textContent = ticketsArray[index].ticketPriority;
    tdCreatedOn.textContent = ticketsArray[index].startDate;
    tdDeadline.textContent = ticketsArray[index].deadline;
    
    tdRemainingTime.classList.add("remainingTime");
    tdRemoveButton.textContent = "X"
    tdRemoveButton.dataset.id = index;
    tdRemoveButton.addEventListener("click", removeTicket)

    tdRemove.appendChild(tdRemoveButton);

    tr.appendChild(tdTicketNo);
    tr.appendChild(tdProject);
    tr.appendChild(tdPriority);
    tr.appendChild(tdCreatedOn);
    tr.appendChild(tdDeadline);
    tr.appendChild(tdRemainingTime);
    tr.appendChild(tdRemove);

    ticketsTableBody.appendChild(tr)
}

// DEADLINE
function setDeadline(project, priority){
    let indexOfTheSLA;
    slaArray.forEach(function(item, index){
        if(item.name === project){
            indexOfTheSLA = index
            return;
        }
    })
    
    const startDate = new Date((ticketsArray[ticketsArray.length-1].startDate)).getTime()
    const endDate = new Date(startDate + (slaArray[indexOfTheSLA][priority] * 60 * 60 * 1000));
    
    ticketsArray[ticketsArray.length-1].deadline = `${endDate.getFullYear()}-${(endDate.getMonth()+1) < 10 ? "0" + (endDate.getMonth()+1): (endDate.getMonth()+1)}-${endDate.getDate() < 10 ? "0"+endDate.getDate() : endDate.getDate()} ${endDate.getHours() < 10 ? "0" + endDate.getHours() : endDate.getHours()}:${endDate.getMinutes() < 10 ? "0" + endDate.getMinutes() : endDate.getMinutes()}`;
}

// REMAINING TIME
function setRemainingTime(){
    const remainingTimeArray = document.querySelectorAll(".remainingTime");
    if(ticketsArray.length > 0){
        for(let i = 0; i < ticketsArray.length; i++){
            const startDate = new Date();
            const deadline = new Date(ticketsArray[i].deadline);
            const difference = deadline - startDate;
            const hours = Math.floor((difference) / 1000 / 60 / 60);
            const minutes = Math.floor(((difference) / 1000 / 60)) % 60;
            const seconds = Math.floor((difference) / 1000 % 60)
            const remainingTime = `${hours < 10 ? "0" + hours : hours}h:${minutes < 10 ? "0" + minutes : minutes}m:${seconds < 10 ? "0" + seconds : seconds}s`
            
            remainingTimeArray[i].textContent = remainingTime;

            if(hours <= 0){
                remainingTimeArray[i].style.color = "red"
            }
            if(hours < 0){
                remainingTimeArray[i].textContent = "SLA FAILED";
                remainingTimeArray[i].style.fontWeight = "bold"
            }
            if(hours > 0){
                remainingTimeArray[i].style.fontWeight = "normal"
                remainingTimeArray[i].style.color = "black"
            }
            if(hours === 1 && minutes === 0 && seconds === 0){
                const text = `Only 1 Hour left to resolve Ticket #${ticketsArray[i].ticketNo}`;
                const notification = new Notification("Reminder", { body: text });
            }
            if(hours === 0 && minutes === 0 && seconds === 0){
                const text = `SLA FAILED #${ticketsArray[i].ticketNo}`;
                const notification = new Notification("Reminder", { body: text });
            }
        }
    }
    
}

// COOKIES
function addCookie(){
    let myJSONString = ""
    for(let i = 0; i < ticketsArray.length; i++){
        myJSONString += JSON.stringify(ticketsArray[i]) + "|";
    }

    document.cookie = `${myJSONString}; expires=Thu, 18 Dec 2030 12:00:00 UTC`

    myJSONString = ""
    for(let i = 0; i < slaArray.length; i++){
        myJSONString += JSON.stringify(slaArray[i]) + "|";
    }

   document.cookie = `sla=${myJSONString}; expires=Thu, 18 Dec 2030 12:00:00 UTC`

}

function getTicketsFromCookies(){
    let cookies = document.cookie;
    cookies = cookies.replace("sla=", "");
    cookies = cookies.replace("; ", "");

    let splitCookies = cookies.split("|");
    splitCookies.pop()
    ticketsArray = [];
    
    for(let i = 0; i < splitCookies.length; i++){
        if(splitCookies[i].includes("ticketNo")){
            ticketsArray.push(JSON.parse(splitCookies[i]));
            
        }
    }
    for(let i = 0; i < ticketsArray.length; i++){
        addAndAppendTickets(i)
    }
}



const inter = setInterval(setRemainingTime, 1000)



// POPUP

settingsImage.addEventListener("click", function(){
    popup.style.display = "block";
    wrapper.style.filter = "blur(5px)"
    

})



saveSLAButton.addEventListener("click", function(){
    const allProjects = document.querySelectorAll("div#slaList input");

   slaArray = [];
   for(let i = 0; i < allProjects.length; i+=5){
        slaArray.push({
                    name: allProjects[i].value,
                    P1: allProjects[i+1].value,
                    P2: allProjects[i+2].value,
                    P3: allProjects[i+3].value,
                    P4: allProjects[i+4].value
        })
   }

    let myJSONString = ""
    for(let i = 0; i < slaArray.length; i++){
        myJSONString += JSON.stringify(slaArray[i]) + "|";
    }

    document.cookie = `sla=${myJSONString}; expires=Thu, 02 oct 2030 9:15:00 UTC`
    document.location.href = "index.html"
})


function getSlaFromCookies(){
    let cookies = document.cookie;
    cookies = cookies.replace("sla=", "");
    cookies = cookies.replace("; ", "");

    let splitCookies = cookies.split("|");
    // LAST ELEMENT OF SPLITCOOKIES ARRAY CONTAINS ONLY | SIGN SO IT HAVE TO BE REMOVED
    splitCookies.pop()

      
    if(document.cookie.includes("sla=")){
        slaArray = []
    }
    
    
    for(let i = 0; i < splitCookies.length; i++){
        if(splitCookies[i].includes("name")){
            slaArray.push(JSON.parse(splitCookies[i]))
        }
    }
    getProjectsFromSlaArray();     
}


// This function creates projects and SLA table which user can change
function addAndAppendSla(){
    if(slaArray.length > 0){
        for(let i = 0; i < slaArray.length; i++){
            const tr = document.createElement("tr");

            const tdProjectName = document.createElement("td");
            const tdP1 = document.createElement("td");
            const tdP2 = document.createElement("td");
            const tdP3 = document.createElement("td");
            const tdP4 = document.createElement("td");
            const tdDeleteRow = document.createElement("td");
            const deleteButton = document.createElement("button");

            const inpProjectName = document.createElement("input");
            const inpP1 = document.createElement("input");
            const inpP2 = document.createElement("input");
            const inpP3 = document.createElement("input");
            const inpP4 = document.createElement("input");

            inpProjectName.value = slaArray[i].name;
            inpP1.value = slaArray[i].P1;
            inpP2.value = slaArray[i].P2;
            inpP3.value = slaArray[i].P3;
            inpP4.value = slaArray[i].P4;

            deleteButton.textContent = "X"
            deleteButton.dataset.rowNumber = i;
            deleteButton.addEventListener("click", removeRow)
            

            tdProjectName.appendChild(inpProjectName);
            tdP1.appendChild(inpP1);
            tdP2.appendChild(inpP2);
            tdP3.appendChild(inpP3);
            tdP4.appendChild(inpP4);
            tdDeleteRow.appendChild(deleteButton);
            
            tr.appendChild(tdProjectName);
            tr.appendChild(tdP1);
            tr.appendChild(tdP2);
            tr.appendChild(tdP3);
            tr.appendChild(tdP4);
            tr.appendChild(tdDeleteRow)

            slaTableBody.appendChild(tr);
        }
    }
}

function addProject(){

    const tr = document.createElement("tr");

    const tdProjectName = document.createElement("td");
    const tdP1 = document.createElement("td");
    const tdP2 = document.createElement("td");
    const tdP3 = document.createElement("td");
    const tdP4 = document.createElement("td");
    const tdDeleteRow = document.createElement("td");
    const deleteButton = document.createElement("button");

    const inpProjectName = document.createElement("input");
    const inpP1 = document.createElement("input");
    const inpP2 = document.createElement("input");
    const inpP3 = document.createElement("input");
    const inpP4 = document.createElement("input");

    inpProjectName.value = `Project`
    inpP1.value = 1
    inpP2.value = 1
    inpP3.value = 1
    inpP4.value = 1

    deleteButton.textContent = "X"
    deleteButton.dataset.rowNumber = document.querySelectorAll("button[data-row-number]").length;
    deleteButton.addEventListener("click", removeRow)
    

    tdProjectName.appendChild(inpProjectName);
    tdP1.appendChild(inpP1);
    tdP2.appendChild(inpP2);
    tdP3.appendChild(inpP3);
    tdP4.appendChild(inpP4);
    tdDeleteRow.appendChild(deleteButton);
    
    tr.appendChild(tdProjectName);
    tr.appendChild(tdP1);
    tr.appendChild(tdP2);
    tr.appendChild(tdP3);
    tr.appendChild(tdP4);
    tr.appendChild(tdDeleteRow)

    slaTableBody.appendChild(tr);

    slaArray.push({
        name: inpProjectName.value,
        P1: inpP1.value,
        P2: inpP2.value,
        P3: inpP3.value,
        P4: inpP4.value
    })
}

function removeRow(){
        const allDeleteButtons = document.querySelectorAll("button[data-row-number]");
        for(let i = 0; i < allDeleteButtons.length; i++){
            allDeleteButtons[i].setAttribute.rowNumber = i;
        }

        slaArray.splice(this.getAttribute("data-row-number"), 1)
        slaTableBody.textContent = "";

        // TABLE IS CLEARED AND CREATED FROM 0 WITH NEW DATA-ID VALUES ASSIGNED TO DELETE BUTTONS
        
        if(slaArray.length > 0){
                addAndAppendSla();
        }
        

}
function getProjectsFromSlaArray(){
    project.textContent = "";
    const option = document.createElement("option")
    option.textContent = "---";
    option.value = "";
    project.appendChild(option);
    for(let i = 0; i < slaArray.length; i++){
        const option = document.createElement("option")
        option.textContent = slaArray[i].name;

        project.appendChild(option);
    }
}