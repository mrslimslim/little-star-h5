/*
 * @Author: mrslimslim 2451319596@qq.com
 * @Date: 2025-05-25 19:03:58
 * @LastEditors: mrslimslim 2451319596@qq.com
 * @LastEditTime: 2025-06-22 10:57:21
 * @FilePath: \little-star-h5\nuxt.config.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },

  // CSS框架和样式
  css: ["~/assets/css/main.css"],

  // 模块配置
  modules: [
    "@nuxtjs/supabase",
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/color-mode",
    "@nuxtjs/google-fonts",
  ],

  // 颜色模式配置
  colorMode: {
    preference: "light", // 儿童应用默认浅色主题
    fallback: "light",
  },

  // Google字体配置（儿童友好字体）
  googleFonts: {
    families: {
      Nunito: [300, 400, 600, 700, 800],
      "Fredoka One": [400],
    },
  },

  // Supabase配置
  supabase: {
    redirectOptions: {
      login: "/",
      callback: "/",
      exclude: ["/*"], // 自用不需要认证
    },
  },

  // 运行时配置
  runtimeConfig: {
    // 服务器端环境变量
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    public: {
      // 客户端环境变量（保留用于非敏感操作）
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_KEY,
    },
  },

  // 应用配置
  app: {
    head: {
      title: "小星星学习记录",
      meta: [
        { charset: "utf-8" },
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
        },
        {
          name: "description",
          content: "帮助儿童记录学习成果，收集小星星，兑换奖励的可爱H5应用",
        },
      ],
    },
  },

  // 实验性功能
  experimental: {
    payloadExtraction: false,
  },
});
