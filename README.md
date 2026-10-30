# dsh-rea-kit · REA 逆向方法论

Methodology + environment-check layer inspired by [morluto/rea](https://github.com/morluto/rea) (Reverse Engineer Anything, 400k★). This is **not** a decompiler — it mounts the *discipline* and generates toolchain plans.

## 五步循环
观察行为（黑盒抓包/strace）→ 定位入口（按类型选刀）→ 静态分析（符号/字符串/模块地图）→ 动态验证（hook假设）→ 文档结晶（已证/待证/下一步三段笔记）。

## 工具 `rea_plan`
按目标类型（apk/native/electron/web/ctf）输出工具链四件套 + 本机环境体检（jadx/ghidra/frida/objdump…在不在）。

## ⚠️ 授权硬门
仅限分析你拥有、获授权或明确允许逆向的目标（自有应用/CTF/互操作/安全审计合同范围）。不确定=先问，不问=不做。

## 安装
```
dsh plugin add github:xushilianzhuren/dsh-rea-kit
```
MIT License.
