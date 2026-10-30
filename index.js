/**
 * dsh-rea-kit · Reverse Engineer Anything 方法论版（Host插件·零依赖）
 * 灵感自 morluto/rea（40万星·agent逆向工程）。本插件是**方法论+环境体检**层：
 * 观察行为→定位入口→静态分析→假设→验证 的循环纪律 + 按目标类型出工具链方案。
 * ⚠️授权硬门：仅限分析你拥有/获授权/明确允许逆向的软件（自有应用/CTF/互操作研究）。
 */
export const name = 'rea-kit'
export const inject = ['systemPrompt', 'tools']
const SECTION = 'rea-kit:rules'
const DEFAULTS = { order: 93, enabled: true, tool: true }

function norm(c) { const r = c ?? {}; return { order: typeof r.order === 'number' ? r.order : DEFAULTS.order, enabled: r.enabled !== false, tool: r.tool !== false } }

function renderSection() {
  return [
    '## REA · 逆向分析方法论（仅限授权目标）',
    '',
    '**授权硬门（先于一切）**：目标软件须是你拥有/已获授权/明确允许逆向的（自有应用、CTF题目、互操作研究、安全审计合同范围）。不确定=先问，不问=不做。',
    '',
    '**五步循环（每个循环产出一份可证伪假设）**：',
    '①**观察行为**——黑盒先行：网络抓包(mitmproxy)/文件系统监控(strace·Procmon)/UI操作记录，先知道"做什么"再问"怎么做"；',
    '②**定位入口**——按目标类型选刀：APK→jadx反编译+frida hook；Electron→app.asar解包；native→ghidra/hopper；网页→devtools断点+ sourcemap；',
    '③**静态分析**——找字符串表/导出符号/配置常量，画出"模块地图"，标记3个最可疑函数；',
    '④**动态验证**——hook假设函数（frida/lldb），改输入看输出是否符合假设；',
    '⑤**文档结晶**——每轮循环落一份"已证事实/待证假设/下一步"三段笔记，逆向是马拉松，断点比聪明重要。',
    '',
    '**产出标准**：最终交付=可复现的报告（版本/环境/工具链/步骤/结论），别人照着能重跑=合格。',
  ].join('\n')
}

const TOOLCHAINS = {
  apk: ['jadx-gui (反编译)', 'apktool (资源+manifest)', 'frida (动态hook)', 'adb logcat (运行时日志)'],
  native: ['ghidra / hopper (反编译)', 'strings + nm + objdump (符号)', 'lldb/gdb (动态调试)', 'frida-trace (API追踪)'],
  electron: ['npx asar extract (解包app.asar)', 'devtools (主进程断点)', 'electron-builder unpacked (直读源码)', 'procmon (文件行为)'],
  web: ['devtools sources+sourcemap', 'mitmproxy (请求重放)', 'webpack-unpack (还原模块)', 'AST工具 (babel反混淆)'],
  ctf: ['file/binwalk (识别格式)', 'ghidra (反编译)', 'z3/angr (符号执行)', 'pwntools (exploit骨架)'],
}

export default function plugin(ctx) {
  const cfg = norm(ctx.config?.[SECTION])
  if (!cfg.enabled) { ctx.logger?.info?.('dsh-rea-kit: disabled'); return }
  ctx.registerSection?.({ name: SECTION, order: cfg.order, render: () => renderSection() })
  if (!cfg.tool) return
  ctx.registerTool?.({
    name: 'rea_plan',
    description: '按目标类型出REA工具链方案+环境体检（各工具在不在）。类型: apk/native/electron/web/ctf。',
    parameters: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['apk', 'native', 'electron', 'web', 'ctf'], description: '目标类型' },
        target: { type: 'string', description: '目标描述（文件名/URL，可选）' },
      },
      required: ['type'],
      additionalProperties: false,
    },
    output: { schema: { type: 'object', properties: { report: { type: 'string' } }, required: ['report'], additionalProperties: false } },
    execute: async (args) => {
      try {
        const type = String(args?.type ?? '')
        const tools = TOOLCHAINS[type]
        if (!tools) return { report: '类型须为 apk/native/electron/web/ctf。' }
        const { execFile } = await import('node:child_process')
        const has = (cmd, arg) => new Promise(res => execFile(cmd, arg, { timeout: 8000 }, e => res(!e)))
        const checks = [
          ['jadx', ['--version']], ['ghidra', ['-version']], ['frida', ['--version']],
          ['objdump', ['--version']], ['python3', ['--version']], ['adb', ['version']],
        ]
        const env = await Promise.all(checks.map(async ([c, a]) => `${c}: ${await has(c, a) ? '✓' : '✗'}`))
        return { report: [
          `【REA 工具链方案·${type}】`,
          args?.target ? `目标: ${args.target}` : '',
          '',
          '工具链四件：',
          ...tools.map(t => '  · ' + t),
          '',
          '本机环境体检：', ...env.map(e => '  ' + e),
          '',
          '⚠️ 授权提醒：确认对目标拥有逆向权限（自有/CTF/合同范围）再动手。',
          '五步循环从"观察行为"开始——先抓包/strace看它做什么，再拆它怎么做。',
        ].filter(Boolean).join('\n') }
      } catch (error) {
        return { report: 'rea-kit 内部错：' + String(error?.message ?? error).slice(0, 160) }
      }
    },
  })
  ctx.logger?.info?.('dsh-rea-kit: registered (order=%d)', cfg.order)
}
