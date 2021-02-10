import axios from 'axios';

const api = axios.create({
    baseURL: 'https://go-to-million.herokuapp.com',
})

export default api;