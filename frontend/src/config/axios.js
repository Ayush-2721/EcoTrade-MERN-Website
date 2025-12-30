import axios from 'axios'

const DEFAULT_BASE_URL = 'https://ecotrade-mern-website.onrender.com'

export const axiosi = axios.create({
	withCredentials: true,
	baseURL: process.env.REACT_APP_BASE_URL || DEFAULT_BASE_URL,
})
