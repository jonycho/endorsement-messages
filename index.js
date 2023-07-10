import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js"

//LINK QUE DA FIREBASE AL CREAR LA BD
const appSettings = {
    databaseURL: "https://real-time-database-541d9-default-rtdb.firebaseio.com/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)

//ref es para ponerle un nombre a la colección, en este caso "endorsement"
const endorsementInDB = ref(database, "endorsement")


const inputFieldEl = document.getElementById("endorsementInput")
const inputFromEl = document.getElementById("fromInput")
const inputToEl = document.getElementById("toInput")
const addButtonEl = document.getElementById("endorsementBtn")
const endorsementEl = document.getElementById("endorsementMsg")


//onValue para listar los elementos de la BD. Como me devuelve un objeto lo transformo en un array. Lo recorro y lo voy añadiendo al div.
//snapshot.val() tiene guardado los valores de la BD

onValue(endorsementInDB, function(snapshot) {
    
    //Debo evaluar si hay algo en la BD o no, para eso uso el exists en snapshot y si no muestro un texto

    if(snapshot.exists()){
    
    //Uso .entries para obtener por separado el id y el valor de lo insertado en la BD
    let itemsArray = Object.entries(snapshot.val())
   
    //IMPORTANTE!! Cada vez que hay un cambio en la BD se debe limpiar el lugar donde van colocado la lista que viene de la BD
    clearEndorsementListEl()
    
    itemsArray.forEach(item => appendEndorsementToDiv(item))
    }else{
	endorsementEl.innerHTML = "<p class='nomsg'>No endorsement published</p>"
    }
})

addButtonEl.addEventListener("click", function() {
    
    let msgEndorsement = {
        msg:inputFieldEl.value,
        fromValue: inputFromEl.value,
        toValue: inputToEl.value,
        likes:0
    }
    
    //INSERTAR EN LA BD
    push(endorsementInDB, msgEndorsement)

    clearInputs()

})

function clearEndorsementListEl(){
     endorsementEl.innerHTML =""
}

function appendEndorsementToDiv(item){
    // Para luego manejar el tema de borrado de un elemento debo crear los p con createElement
    let itemID = item[0]
    let itemFrom = item[1].fromValue 
    let itemTo = item[1].toValue 
    let itemMsg = item[1].msg
    let itemLikes = item[1].likes
    
     // Guardar el mensaje en localStorage por si todavia no está (likes)
    if (!localStorage.getItem(`${itemID}`)) {
        localStorage.setItem(`${itemID}`, JSON.stringify(false))
    }

    let newEl = document.createElement("div")
    newEl.classList.add("msg")
    
    let toEl = document.createElement("h4")
    toEl.textContent = `To ${itemTo}`
    newEl.appendChild(toEl)
    
    let msgEl = document.createElement("p")
    msgEl.textContent = `${itemMsg}`
    newEl.appendChild(msgEl)
    
    
    let divContainerLikes = document.createElement("div")
     divContainerLikes.classList.add("container-likes")
     
     let fromEl = document.createElement("h4")
    fromEl.textContent = `From ${itemFrom}`
    divContainerLikes.appendChild(fromEl)
    
    let likesEl = document.createElement("h3")
    likesEl.innerHTML = `<i class="fa-solid fa-heart"></i> ${itemLikes}`

    if (JSON.parse(localStorage.getItem(itemID)) === true) {
        likesEl.style.color = "#F43F5E"
    }
    else if (JSON.parse(localStorage.getItem(itemID)) === false) {
        likesEl.style.color = "#000"
    }


    divContainerLikes.appendChild(likesEl)


    
    
    newEl.appendChild(divContainerLikes)
    
    
    likesEl.addEventListener("click",(e)=>{
        e.stopPropagation()
        
         if (JSON.parse(localStorage.getItem(itemID)) === false) {
            itemLikes++
            localStorage.setItem(`${itemID}`, JSON.stringify(true))
        }
        else if (JSON.parse(localStorage.getItem(itemID)) === true) {
            itemLikes--
            localStorage.setItem(`${itemID}`, JSON.stringify(false))
        }
        update(ref(database, `endorsement/${itemID}`), {likes: itemLikes})
        
    })

    newEl.addEventListener("click", function() {
        // Debo especificarle la ruta completa donde esta lo que quiero borrar
        let exactLocationOfItemInDB = ref(database, `endorsement/${itemID}`)
        
        // Luego lo elimino con la ruta especificada
        remove(exactLocationOfItemInDB)

        //Eliminar el id del localstorage
        localStorage.removeItem(itemID)
    })
    
    endorsementEl.prepend(newEl) 

}

function clearInputs(){
     inputFieldEl.value =""
     inputFromEl.value =""
     inputToEl.value =""
}