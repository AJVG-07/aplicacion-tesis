import { useState, useEffect } from "react"; 
import axios from "axios";

const BASE_URL = "http://127.0.0.12:3000/usuarios/"

const App = () => {

  const [items, setItems] = useState([]);
  const [newNombre, setNewNombre] = useState(""); 
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
  axios.get(`${BASE_URL}`) 
    .then((response) => {
    setItems (response.data)
    console.log(response.data)
  })
    .catch((error) => {
      console.error("Error al obtener los items:", error);
    })
  }, []); 
  
  const handleCreate = () => {
    if(newNombre.trim() && newEmail.trim()){
      axios.post(`${BASE_URL}add`, {
        nombre: newNombre,
        email: newEmail
      })
      .then((response) => {
        setItems((prevItems) => [...prevItems, response.data]);
        setNewNombre("");
        setNewEmail("");
      })
      .catch((error) => {
        console.error("Error al crear el item:", error);
      });
    }
  }

  
  const handleDelete = (id) => 
    { axios.delete(`${BASE_URL}delete/${id}`)
    .then(() => {
      setItems((prevItems) => previtems.filter((item) => item.id !== id));
    })
    .catch((error) => {
      console.error("Error al eliminar el item: ", error);
    })
  };

  const handleUpdate = (id,nombre,email) => {
    const newNombre = prompt("Ingrese el nuevo nombre:", nombre);
    const newEmail = prompt("Ingrese el nuevo email:", email);
    
    if(newNombre !== nombre && newEmail !== email){
      axios.put(`${BASE_URL}update/${id}`, {
        nombre: newNombre,
        email: newEmail
      })
      .then(() => {
        setItems((prevItems) => {
          prevItems.map((item) => {
            item.id === id ? {...item, nombre: newNombre, email: newEmail} : item
          }) 
        });
      })
      .catch((error) => {
        console.error("Error al actualizar el item: ", error);
      })
    }
  };

  return (
    <div>
      <h1>Lista de Usuarios</h1>
      <input 
        type="text" 
        placeholder="Nombre"
        value={newNombre}
        onChange={(e) => setNewNombre(e.target.value)}
      />
            <input 
        type="text" 
        placeholder="Email"
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
      />

      <button onClick={handleCreate}>Crear Usuario</button>

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <span style={{marginRight: '10px'}}>{item.id}</span>
            <span style={{marginRight: '10px'}}>{item.nombre}</span>
            <span style={{marginRight: '10px'}}>{item.email}</span>
            <button onClick={() => handleUpdate(item.id, item.nombre, item.email)}>Actualizar</button>
            <button onClick={() => handleDelete(item.id)}>Eliminar</button>
            </li>
        ))}
      </ul>
    </div>
  );
};

export default App;