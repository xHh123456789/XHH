// api/index.js - 统一导出所有 API
import * as orderApi from './order'
import * as authApi from './auth'
import * as statsApi from './stats'

export { orderApi, authApi, statsApi }
