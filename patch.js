// ============================================================
//  sub-web 前端补丁（兼容 Vue 2）
//  1. 去掉「后端地址」输入框
//  2. 替换远程配置列表为 ACL4SSR 完整规则集
// ============================================================

(function () {
  "use strict";

  // ---- ACL4SSR 远程配置列表 ----
  var ACL4SSR_CONFIGS = [
    {
      label: "ACL4SSR",
      options: [
        {
          label: "ACL4SSR_Online 默认版 分组比较全(与Github同步)",
          value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online.ini",
        },
        {
          label: "ACL4SSR_Online_Mini 精简版 带港美日国家(与Github同步)",
          value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini.ini",
        },
        {
          label: "ACL4SSR_Online_Full 全分组 重度用户使用(与Github同步)",
          value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full.ini",
        },
        {
          label: "ACL4SSR_Online_Full_MultiMode 全分组 多模式(与Github同步)",
          value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_MultiMode.ini",
        },
        {
          label: "ACL4SSR_Online_Full_NoAuto 全分组 无自动测速(与Github同步)",
          value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_NoAuto.ini",
        },
        {
          label: "ACL4SSR_Online_Full_AdblockPlus 全分组 更多去广告(与Github同步)",
          value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_AdblockPlus.ini",
        },
        {
          label: "ACL4SSR_Online_Full_Netflix 全分组 奈飞全量(与Github同步)",
          value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_Netflix.ini",
        },
        {
          label: "ACL4SSR_Online_Full_Google 全分组 谷歌细分(与Github同步)",
          value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_Google.ini",
        },
        {
          label: "ACL4SSR_Online_Mini_MultiCountry 精简版 多国分组(与Github同步)",
          value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_MultiCountry.ini",
        },
        {
          label: "ACL4SSR_Online_MultiPlatform 多平台版(与Github同步)",
          value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_MultiPlatform.ini",
        },
      ],
    },
    {
      label: "default",
      options: [
        { label: "No-Urltest", value: "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/universal/no-urltest.ini" },
        { label: "Urltest", value: "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/universal/urltest.ini" },
      ],
    },
    {
      label: "customized",
      options: [
        { label: "Maying", value: "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/customized/maying.ini" },
        { label: "Ytoo", value: "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/customized/ytoo.ini" },
        { label: "FlowerCloud", value: "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/customized/flowercloud.ini" },
        { label: "Nexitally", value: "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/customized/nexitally.ini" },
        { label: "SoCloud", value: "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/customized/socloud.ini" },
        { label: "ARK", value: "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/customized/ark.ini" },
        { label: "ssrCloud", value: "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/customized/ssrcloud.ini" },
      ],
    },
  ];

  // ---- 延迟执行，确保 Vue 已渲染 ----
  function patch() {
    // 1. 隐藏「后端地址」输入框
    var labels = document.querySelectorAll(".el-form-item__label");
    labels.forEach(function (label) {
      if (label.textContent && label.textContent.indexOf("后端地址") !== -1) {
        var item = label.closest(".el-form-item");
        if (item) item.style.display = "none";
      }
    });

    // 2. 查找 Vue 实例并替换远程配置
    var app = document.getElementById("app");
    if (app && app.__vue__) {
      var vm = app.__vue__;
      // 遍历组件树找到有 remoteConfig 的组件
      function findAndPatch(component) {
        if (component.options && component.options.data) {
          try {
            var data = typeof component.options.data === "function"
              ? component.options.data() : component.options.data;
            if (data && data.options && data.options.remoteConfig) {
              // 直接修改 data 选项
              component.options.data = function () {
                var d = typeof component.options.data === "function"
                  ? component.options.data() : {};
                d.options = d.options || {};
                d.options.remoteConfig = ACL4SSR_CONFIGS;
                return d;
              };
              return true;
            }
          } catch (e) {}
        }
        return false;
      }

      // 遍历所有子组件
      function walkTree(comp) {
        if (findAndPatch(comp)) return;
        if (comp.$children) {
          comp.$children.forEach(walkTree);
        }
      }
      walkTree(vm);

      // 同时修改当前运行中的实例
      function patchRunning(comp) {
        if (comp.$data && comp.$data.options && comp.$data.options.remoteConfig) {
          comp.$data.options.remoteConfig = ACL4SSR_CONFIGS;
        }
        if (comp.$children) {
          comp.$children.forEach(patchRunning);
        }
      }
      patchRunning(vm);
    }
  }

  // 多次尝试补丁（Vue 渲染需要时间）
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(patch, 500);
      setTimeout(patch, 1500);
    });
  } else {
    setTimeout(patch, 500);
    setTimeout(patch, 1500);
  }
})();
