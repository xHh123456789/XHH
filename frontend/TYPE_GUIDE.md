# TypeScript 开发规范

## 1. 目录结构

```
src/ ├── types/ # 全局类型定义 │ ├── index.ts # 核心业务类型（唯一的类型来源） │ └── global.d.ts # 全局声明（环境变量） ├── api/ # API 请求（带类型） ├── stores/ # Pinia Store（带类型） ├── components/ # 组件（带类型） ├── views/ # 页面（带类型） ├── utils/ # 工具（request.ts 拦截器） ├── directives/ # 自定义指令（ObjectDirective 类型） └── plugins/ # 插件（App 类型）
```

## 2. 命名规范

| 类型     | 规范         | 示例            |
| -------- | ------------ | --------------- |
| 接口     | 大驼峰       | `Order`、`User` |
| 类型别名 | 大驼峰       | `OrderStatus`   |
| 泛型参数 | 单个大写字母 | `T`、`K`        |

## 3. 核心规则（本项目实际）

- **所有业务类型统一放 `src/types/index.ts`**，禁止在组件里重复定义接口（复用 `RegisterParams` 那样）
- **对象结构用 interface，联合类型用 type**：`type OrderStatus = '待处理' | '处理中' | '已完成'`
- **空数组必须显式泛型**：`ref<Order[]>([])`，否则推断成 `never[]`
- **axios 双泛型**（响应拦截器改写了返回值）：`request.get<unknown, Order[]>('/orders')`
- **Props 用泛型 + withDefaults**；**emits 用函数重载写法**
- **DOM ref**：`ref<HTMLDivElement | null>(null)`
- **图表**：`import type { EChartsOption } from 'echarts'`（库自带类型，勿装 @types/echarts）
- **不用的参数加下划线**：`(to, _from, next)`（守卫位置绑定）
- **as 断言只用于逻辑必然为真的收窄**，禁止 as any 逃避检查

## 4. 验证命令

```bash

```
