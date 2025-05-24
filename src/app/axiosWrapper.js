import axios from 'axios'
import { toast } from 'react-toastify'
import LocalStorageService from '../services/localStorageService'

const baseURL = import.meta.env.VITE_API_URL

export const getHttpFormHeaders = () => {
	const token = LocalStorageService.getAccessToken()
	const headers = {
		'Content-Type': 'application/json',
		Accept: 'application/json'
	}
	if (token) {
		headers['Authorization'] = `Bearer ${token}`
		headers['x-access-token'] = token
	}
	return headers
}

export const getHttpFileFormHeaders = () => {
	const token = LocalStorageService.getAccessToken()
	const headers = { Accept: 'application/json' }
	if (token) {
		headers['Authorization'] = `Bearer ${token}`
		headers['x-access-token'] = token
	}
	return headers
}

export const sanitizePath = (path) => {
	const queryStringArray = path.split('?')
	let newString = []
	if (queryStringArray.length === 2) {
		const query = queryStringArray[1]
		const queryArray = query.split('&')
		queryArray.forEach((query) => {
			const keyPair = query.split('=')
			if (keyPair.length === 2 && keyPair[1] !== undefined && keyPair[1] !== '' && keyPair[1] !== 'undefined') {
				newString.push(keyPair.join('='))
			}
		})
	}
	return queryStringArray[0] + (newString.length > 0 ? '?' + newString.join('&') : '')
}

export const sanitizeFormData = (formData) => {
	if (!formData) {
		return
	}
	Object.keys(formData).forEach((key) => {
		if (formData[key] === '' || formData[key] === null || formData[key] === undefined) {
			delete formData[key]
		}
	})
	return formData
}

export const formatUnsanitizeFormData = (formData) => {
	if (!formData) {
		return
	}
	Object.keys(formData).forEach((key) => {
		if (formData[key] === '' || formData[key] === undefined) {
			formData[key] = null
		}
	})
	return formData
}

export const axiosClient = axios.create({
	baseURL
})

axiosClient.interceptors.request.use(
	(request) => {
		return request
	},
	(error) => {
		return Promise.reject(error)
	}
)

let getNewToken = undefined


//Axios Response Interceptor
axiosClient.interceptors.response.use(
	(response) => {
		return response
	},
	async (error) => {
		const originalConfig = error.config

		if (originalConfig.url === 'e-commerce/auth/login' || originalConfig.url === 'e-commerce/auth/refresh' || originalConfig.url === 'auth/otp-verify') {
			return Promise.reject(error)
		}

		if (error.response.status !== 401) {
			if (
				error.response.status === 500 ||
				error.response.status === 501 ||
				error.response.status === 502 ||
				error.response.status === 503 ||
				error.response.status === 504
			) {
				console.log('Server Error Occurred!')
				// window.location = `${window.location.origin}/server-error`
			}
			return Promise.reject(error)
		}

		try {
			if (!getNewToken) {
				getNewToken = (async () => {
					const refreshToken = LocalStorageService.getRefreshToken()
					if (!refreshToken) {
						throw new Error('Refresh token not available, please login again!')
					}
					return await axiosClient.post('auth/refresh-token', { refreshToken: refreshToken })
				})()
			}
			const refreshTokenResponse = await getNewToken()
			originalConfig.headers.Authorization = `Bearer ${refreshTokenResponse.data.token}`
			LocalStorageService.setTokenData(refreshTokenResponse.data)

			try {
				return await axiosClient.request(originalConfig)
			} catch (innerError) {
				if (innerError.response.status === 401) {
					throw innerError
				} else {
					toast.error(error.response?.data?.error?.message || 'Server error!', { toastId: error.response.request.responseURL })
				}
			}
		// eslint-disable-next-line no-unused-vars
		} catch (error) {
			toast.error("Session expired please login again!")
			LocalStorageService.clearAuthData()
			window.location = `${window.location.origin}/?sessionExpired=true`;
		} finally {
			getNewToken = undefined
		}
	}
)

/**
 * @param {object} error
 * @returns Response data if any received from the server
 */
export const handleError = (error) => {
	if (!error.response) {
		toast.error('Failed to connect to server')
		return { status: 500, message: 'Failed to connect to server' }
	} else {
		if (!error.response.request.responseURL.includes('notification')) {
			toast.error(error.response?.data?.message || 'Server error!', { toastId: error.response.request.responseURL })
		}
		return { status: error.response?.status || 500, message: error.response?.data?.message || 'Server error!' }
	}
}

/**
 * Make a GET request using Axios
 * @param {string} url - The route of requested resource excluding the base URL.
 * @param {object} options - Custom options for the request like Abortcontroller.
 */
export const get = async (url, options) => {
	try {
		const path = sanitizePath(url)
		const response = await axiosClient.get(path, {
			headers: getHttpFormHeaders(),
			...options
		})
		return { status: response.status, message: response.data.message, data: response.data }
	} catch (error) {
		return handleError(error)
	}
}

/**
 * Make a POST request using Axios.
 * Any form data key with empty or Null or Undefined value will be removed.
 * @param {string} url - The route of requested resource excluding the base URL.
 * @param {object} payload - The form data to send with the request.
 * @param {object} options - Custom options for the request like Abortcontroller.
 */
export const post = async (url, payload, options) => {
	try {
		const path = sanitizePath(url)
		const response = await axiosClient.post(path, sanitizeFormData(payload), {
			headers: getHttpFormHeaders(),
			...options
		})
		return { status: response.status, message: response.data.message, data: response.data }
	} catch (error) {
		return handleError(error)
	}
}

/**
 * Make a POST request using Axios without sanitizing the payload.
 * Any form data key with empty or Null or Undefined value will not be removed.
 * @param {string} url - The route of requested resource excluding the base URL.
 * @param {object} payload - The form data to send with the request.
 * @param {object} options - Custom options for the request like Abortcontroller.
 */
export const postUnsanitized = async (url, payload, options) => {
	try {
		const path = sanitizePath(url)
		const response = await axiosClient.post(path, formatUnsanitizeFormData(payload), {
			headers: getHttpFormHeaders(),
			...options
		})
		return { status: response.status, message: response.data.message, data: response.data }
	} catch (error) {
		return handleError(error)
	}
}

/**
 * Make a POST request for data uploads using Axios.
 * Any form data key with empty or Null or Undefined value will be removed.
 * @param {string} url - The route of requested resource excluding the base URL.
 * @param {object} payload - Files and other form data to be sent with the request.
 * @param {object} options - Custom options for the request like OnUploadProgress, Abortcontroller etc.
 */
export const postMultipart = async (url, payload, options) => {
	try {
		const response = await axiosClient.post(url, sanitizeFormData(payload), {
			headers: getHttpFileFormHeaders(),
			...options
		})
		return { status: response.status, message: response.data.message, data: response.data }
	} catch (error) {
		return handleError(error)
	}
}

/**
 * Make a POST using Axios for data uploads without sanitizing the payload.
 * Any form data key with empty or Null or Undefined value will not be removed.
 * @param {string} url - The route of requested resource excluding the base URL.
 * @param {object} payload - Files and other form data to be sent with the request.
 * @param {object} options - Custom options for the request like OnUploadProgress, Abortcontroller etc.
 */
export const postMultipartUnsanitized = async (url, payload, options) => {
	try {
		const response = await axiosClient.post(url, formatUnsanitizeFormData(payload), {
			headers: getHttpFileFormHeaders(),
			...options
		})
		return { status: response.status, message: response.data.message, data: response.data }
	} catch (error) {
		return handleError(error)
	}
}

/**
 * Make a PUT request using Axios.
 * Any form data key with empty or Null or Undefined value will be removed.
 * @param {string} url - The route of requested resource excluding the base URL.
 * @param {object} payload - Form data to be sent with the request.
 * @param {object} options - Custom options for the request like Abortcontroller.
 */
export const put = async (url, payload, options) => {
	try {
		const path = sanitizePath(url)
		const response = await axiosClient.put(path, sanitizeFormData(payload), {
			headers: getHttpFormHeaders(),
			...options
		})
		return { status: response.status, message: response.data.message, data: response.data }
	} catch (error) {
		return handleError(error)
	}
}

/**
 * Make a PUT request using Axios without sanitizing the payload.
 * Any form data key with empty or Null or Undefined value will not be removed.
 * @param {string} url - The route of requested resource excluding the base URL.
 * @param {object} payload - Form data to be sent with the request.
 * @param {object} options - Custom options for the request like Abortcontroller.
 */
export const putUnsanitized = async (url, payload, options) => {
	try {
		const path = sanitizePath(url)
		const response = await axiosClient.put(path, formatUnsanitizeFormData(payload), {
			headers: getHttpFormHeaders(),
			...options
		})
		return { status: response.status, message: response.data.message, data: response.data }
	} catch (error) {
		return handleError(error)
	}
}

/**
 * Make a PUT request for data uploads using Axios.
 * Any form data key with empty or Null or Undefined value will be removed.
 * @param {string} url - The route of requested resource excluding the base URL.
 * @param {object} payload - Files and other form data to be sent with the request.
 * @param {object} options - Custom options for the request like OnUploadProgress, Abortcontroller etc.
 */
export const putMultipart = async (url, payload, options) => {
	try {
		const response = await axiosClient.put(url, sanitizeFormData(payload), {
			headers: getHttpFileFormHeaders(),
			...options
		})
		return { status: response.status, message: response.data.message, data: response.data }
	} catch (error) {
		return handleError(error)
	}
}

/**
 * Make a PUT using Axios for data uploads without sanitizing the payload.
 * Any form data key with empty or Null or Undefined value will not be removed.
 * @param {string} url - The route of requested resource excluding the base URL.
 * @param {object} payload - Files and other form data to be sent with the request.
 * @param {object} options - Custom options for the request like OnUploadProgress, Abortcontroller etc.
 */
export const putMultipartUnsanitized = async (url, payload, options) => {
	try {
		const response = await axiosClient.put(url, formatUnsanitizeFormData(payload), {
			headers: getHttpFileFormHeaders(),
			...options
		})
		return { status: response.status, message: response.data.message, data: response.data }
	} catch (error) {
		return handleError(error)
	}
}

/**
 * Make a PATCH request using Axios.
 * Any form data key with empty or Null or Undefined value will be removed.
 * @param {string} url - The route of requested resource excluding the base URL.
 * @param {object} payload - Form data to be sent with the request.
 * @param {object} options - Custom options for the request like Abortcontroller.
 */
export const patch = async (url, payload, options) => {
	try {
		const path = sanitizePath(url)
		const response = await axiosClient.patch(path, sanitizeFormData(payload), {
			headers: getHttpFormHeaders(),
			...options
		})
		return { status: response.status, message: response.data.message, data: response.data }
	} catch (error) {
		return handleError(error)
	}
}

/**
 * Make a PATCH request using Axios without sanitizing the payload.
 * Any form data key with empty or Null or Undefined value will not be removed.
 * @param {string} url - The route of requested resource excluding the base URL.
 * @param {object} payload - Form data to be sent with the request.
 * @param {object} options - Custom options for the request like Abortcontroller.
 */
export const patchUnsanitized = async (url, payload, options) => {
	try {
		const path = sanitizePath(url)
		const response = await axiosClient.patch(path, formatUnsanitizeFormData(payload), {
			headers: getHttpFormHeaders(),
			...options
		})
		return { status: response.status, message: response.data.message, data: response.data }
	} catch (error) {
		return handleError(error)
	}
}

/**
 * Make a DELETE request using Axios
 * @param {string} url - The route of requested resource excluding the base URL.
 * @param {object} options - Custom options for the request like Abortcontroller.
 */
export const destroy = async (url, options) => {
	try {
		const path = sanitizePath(url)
		const response = await axiosClient.delete(path, {
			headers: getHttpFormHeaders(),
			...options
		})
		return { status: response.status, message: response.data.message, data: response.data }
	} catch (error) {
		return handleError(error)
	}
}
