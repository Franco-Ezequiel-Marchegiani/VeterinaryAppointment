let DB; //DataBase

// Selectores de la INterfaz
const form = document.querySelector('form'),
      nombreMascota = document.querySelector('#mascota'),
      nombreCliente = document.querySelector('#cliente'),
      telefono = document.querySelector('#telefono'), 
      fecha = document.querySelector('#fecha'),
      hora = document.querySelector('#hora'),
      sintomas = document.querySelector('#sintomas'),
      citas = document.querySelector('#citas'),
      headingAdministra = document.querySelector('#administra');

// Espera por el DOM Ready
document.addEventListener('DOMContentLoaded', () => {
     // Crear la base de datos
     let crearDB = window.indexedDB.open('citas', 1); //Toma un nombre y una versión

     // Si hay un error lo envia a la consola
     crearDB.onerror = function() {
         // console.log('Hubo un error ');
     }

     // Si todo está bien entonces mostrar en consola y asignar la base de datos
     crearDB.onsuccess = function() {
          //console.log('Todo en orden ');

          // Asigna a la base de datos
          DB = crearDB.result;
          //console.log(DB);

          mostrarCitas();
     }

     // Este método corre solo una vez, es ideal para crear el Schema
     crearDB.onupgradeneeded = function(e) {
          // El evento es la misma base de datos
          let db = e.target.result;

          // Definir el objecstore, toma 2 parámetros, 1el nombre de la base de datos y 2 las opciones
          // Keypath es el índice de las base de datos
          let objectStore = db.createObjectStore('citas', { keyPath: 'key', autoIncrement: true } );

          // Crear los índices y campos de la base de datos, createIndex : 3 parametros, nombre, keypath y opciones
          objectStore.createIndex('mascota', 'mascota', {unique : false } );
          objectStore.createIndex('cliente', 'cliente', {unique : false } );
          objectStore.createIndex('telefono', 'telefono', {unique : false } );
          objectStore.createIndex('fecha', 'fecha', {unique : false } );
          objectStore.createIndex('hora', 'hora', {unique : false } );
          objectStore.createIndex('sintomas', 'sintomas', {unique : false } );

          //console.log('Base de datos creada y lista');
     }
     // Cuando el formulario se envía
     form.addEventListener('submit', agregarDatos);

     function agregarDatos(e) {
          e.preventDefault();

          const nuevaCita = {
               mascota: nombreMascota.value,
               cliente: nombreCliente.value,
               telefono: telefono.value,
               fecha: fecha.value,
               hora: hora.value,
               sintomas: sintomas.value
          }
        //  console.log(nuevaCita);


        // en IndexedDB se utilizan las transacciones
        let transaction = DB.transaction(['citas'], 'readwrite');
        let objectStore = transaction.objectStore('citas');
        //console.log(objectStore);
        let peticion = objectStore.add(nuevaCita);

        //console.log(peticion);

        peticion.onsuccess = () => {
             form.reset();
        }
        transaction.oncomplete = () => {
            // console.log('Cita agregada');
             mostrarCitas();
        }
        transaction.onerror = () => {
             //console.log('Error');
        }
     }

     function mostrarCitas() {
          // Limpia citas anteriores (en caso de haber)
          while(citas.firstChild) {
               citas.removeChild(citas.firstChild);
          }

          // Creamos un objecstore
          let objectStore = DB.transaction('citas').objectStore('citas');

          // Esto retorna una petición
          objectStore.openCursor().onsuccess = function(e) {
               // Cursor se va a ubicar en el registro indicado para que pueda acceder a los datos
               let cursor = e.target.result;
               //console.log(cursor);
               if(cursor) {
                    let citaHTML = document.createElement('li');
                    citaHTML.setAttribute('data-cita-id', cursor.value.key);
                    citaHTML.classList.add('list-group-item');

                    citaHTML.innerHTML = `
     <p class="font-weight-bold">Mascota: <span class="font-weight-normal">${cursor.value.mascota}</span></p>
     
     <p class="font-weight-bold">Mascota: <span class="font-weight-normal">${cursor.value.cliente}</span></p>
     
     <p class="font-weight-bold">Mascota: <span class="font-weight-normal">${cursor.value.telefono}</span></p>
     
     <p class="font-weight-bold">Mascota: <span class="font-weight-normal">${cursor.value.fecha}</span></p>

     <p class="font-weight-bold">Mascota: <span class="font-weight-normal">${cursor.value.hora}</span></p>

     <p class="font-weight-bold">Mascota: <span class="font-weight-normal">${cursor.value.sintomas} </span> </p>
                    `;

                    //boton de borrar
                    const botonBorrar = document.createElement('submit');
                    botonBorrar.classList.add('borrar', 'btn', 'btn-danger');
                    botonBorrar.innerHTML = '<span aria-hidden="true">x</span> Borrar';
                    botonBorrar.onclick = borrarCita;
                    citaHTML.appendChild(botonBorrar);

                    // append en el padre.
                    citas.appendChild(citaHTML);

                    // Consulta los próximos registros
                    cursor.continue();

               } else {
                    // Cuando no hay registros
                    if(!citas.firstChild){
                         headingAdministra.textContent = 'Agrega una cita para comenzar';
                         let listado = document.createElement('p');
                         listado.classList.add('text-center');
                         listado.textContent = 'No hay registros aún';
                         citas.appendChild(listado);
                    } else {
                         headingAdministra.textContent = 'Administra tus citas';
                    }
               }               
          }
     }


     function borrarCita(e) {
          let citaID = Number( e.target.parentElement.getAttribute('data-cita-id') );

        // en IndexedDB se utilizan las transacciones
        let transaction = DB.transaction(['citas'], 'readwrite');
        let objectStore = transaction.objectStore('citas');
        //console.log(objectStore);
        let peticion = objectStore.delete(citaID);

        transaction.oncomplete = () => {
          e.target.parentElement.parentElement.removeChild(e.target.parentElement);
          console.log(`Se eliminó la cita ${citaID}`);

          // Cuando no hay registros
          if(!citas.firstChild){
               headingAdministra.textContent = 'Agrega una cita para comenzar';
               let listado = document.createElement('p');
               listado.classList.add('text-center');
               listado.textContent = 'No hay registros aún';
               citas.appendChild(listado);
          } else {
               headingAdministra.textContent = 'Administra tus citas';
          }          
        }
     }
})
