import axios from 'axios'
import Vue from 'vue'

const config = {
  baseURL: 'http://localhost:5000/',
  timeout: 5 * 1000, // 请求超时时间设置
  crossDomain: true,
  // withCredentials: true, // Check cross-site Access-Control
  // 定义可获得的http响应状态码
  // return true、设置为null或者undefined，promise将resolved,否则将rejected
  validateStatus(status) {
    return status >= 200 && status < 500
  },
}
const _axios = axios.create(config)

_axios.interceptors.request.use((originConfig) => {
  const reqConfig = { ...originConfig }

  // step1: 容错处理
  if (!reqConfig.url) {
    /* eslint-disable-next-line */
    console.error('request need url')
    throw new Error({
      source: 'axiosInterceptors',
      message: 'request need url',
    })
  }

  if (!reqConfig.method) { // 默认使用 get 请求
    reqConfig.method = 'get'
  }
  // 大小写容错
  reqConfig.method = reqConfig.method.toLowerCase()

  // 参数容错
  if (reqConfig.method === 'get') {
    if (!reqConfig.params) { // 防止字段用错
      reqConfig.params = reqConfig.data || {}
    }
  } else if (reqConfig.method === 'post') {
    if (!reqConfig.data) { // 防止字段用错
      reqConfig.data = reqConfig.params || {}
    }

    // 检测是否包含文件类型, 若包含则进行 formData 封装
    // 检查子项是否有 Object 类型, 若有则字符串化
    let hasFile = false
    Object.keys(reqConfig.data).forEach((key) => {
      if (typeof reqConfig.data[key] === 'object') {
        const item = reqConfig.data[key]
        if (item instanceof FileList || item instanceof File || item instanceof Blob) {
          hasFile = true
        } else if (Object.prototype.toString.call(item) === '[object Object]') {
          reqConfig.data[key] = JSON.stringify(reqConfig.data[key])
        }
      }
    })

    // 检测到存在文件使用 FormData 提交数据
    if (hasFile) {
      const formData = new FormData()
      Object.keys(reqConfig.data).forEach((key) => {
        formData.append(key, reqConfig.data[key])
      })
      reqConfig.data = formData
    }
  } else {
    // TODO: 其他类型请求数据格式处理
    /* eslint-disable-next-line */
    console.warn(`其他请求类型: ${reqConfig.method}, 暂无自动处理`)
  }
    return reqConfig;  //添加这一行
  },(error) => {
    return Promise.reject(error);
})

_axios.interceptors.response.use(async (res) => {
  let { code, message } = res.data // eslint-disable-line
  if (res.status.toString().charAt(0) === '2') {
    return res.data
  }

  return new Promise(async (resolve, reject) => {
    // 将本次失败请求保存
    const { params, url, method } = res.config

    // 处理 API 异常
    let { error_code, msg } = res.data // eslint-disable-line
    if (msg instanceof Object) {
      let showMsg = ''
      Object.getOwnPropertyNames(msg).forEach((key, index) => {
        if (index === 0) {
          showMsg = msg[key] // 如果是数组，展示第一条
        }
      })
      msg = showMsg
    }
    // 如果令牌无效或者是refreshToken相关异常
    if (error_code === 10000 || error_code === 10100) {
      setTimeout(() => {
        const { origin } = window.location
        window.location.href = origin
      }, 1500)
    }

    reject(res.data)
  })
}, (error) => {
  if (!error.response) {
    console.log('error', error)
  }

  // 判断请求超时
  if (error.code === 'ECONNABORTED' && error.message.indexOf('timeout') !== -1) {
    console.log('warning', 请求超时)
  }
  return Promise.reject(error)
})

// 导出常用函数

/**
 * @param {string} url
 * @param {object} data
 * @param {object} params
 */
export function post(url, data = {}, params = {}) {
  return _axios({
    method: 'post',
    url,
    data,
    params,
  })
}

/**
 * @param {string} url
 * @param {object} params
 */
export function get(url, params = {}) {
  return _axios({
    method: 'get',
    url,
    params,
  })
}

/**
 * @param {string} url
 * @param {object} data
 * @param {object} params
 */
export function put(url, data = {}, params = {}) {
  return _axios({
    method: 'put',
    url,
    params,
    data,
  })
}

/**
 * @param {string} url
 * @param {object} params
 */
export function _delete(url, params = {}) {
  return _axios({
    method: 'delete',
    url,
    params,
  })
}

export default _axios
