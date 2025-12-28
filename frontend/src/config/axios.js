import axios from 'axios'

const DEFAULT_BASE_URL = 'http://localhost:8000/'

export const axiosi = axios.create({
	withCredentials: true,
	baseURL: process.env.REACT_APP_BASE_URL || DEFAULT_BASE_URL,
})