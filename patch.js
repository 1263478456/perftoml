// ============================================================
//  sub-web 前端补丁（兼容 Vue 2）
//  1. 彻底移除「后端地址」和「短链」相关元素
//  2. 替换远程配置列表为 ACL4SSR 完整规则集
//  3. 添加「自定义UA」输入框，拼入订阅链接
// ============================================================

(function () {
  "use strict";

  // ---- ACL4SSR 远程配置列表 ----
  var ACL4SSR_CONFIGS = [
    {
      label: "ACL4SSR",
      options: [
        { label: "ACL4SSR_Online 默认版 分组比较全(与Github同步)", value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online.ini" },
        { label: "ACL4SSR_Online_Mini 精简版 带港美日国家(与Github同步)", value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini.ini" },
        { label: "ACL4SSR_Online_Full 全分组 重度用户使用(与Github同步)", value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full.ini" },
        { label: "ACL4SSR_Online_Full_MultiMode 全分组 多模式(与Github同步)", value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_MultiMode.ini" },
        { label: "ACL4SSR_Online_Full_NoAuto 全分组 无自动测速(与Github同步)", value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_NoAuto.ini" },
        { label: "ACL4SSR_Online_Full_AdblockPlus 全分组 更多去广告(与Github同步)", value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_AdblockPlus.ini" },
        { label: "ACL4SSR_Online_Full_Netflix 全分组 奈飞全量(与Github同步)", value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_Netflix.ini" },
        { label: "ACL4SSR_Online_Full_Google 全分组 谷歌细分(与Github同步)", value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_Google.ini" },
        { label: "ACL4SSR_Online_Mini_MultiCountry 精简版 多国分组(与Github同步)", value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_MultiCountry.ini" },
        { label: "ACL4SSR_Online_MultiPlatform 多平台版(与Github同步)", value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_MultiPlatform.ini" },
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

  // ---- 常用 UA 预设 ----
  var UA_PRESETS = [
    { label: "clash.meta", value: "clash.meta" },
    { label: "ClashForAndroid/2.5.12", value: "ClashForAndroid/2.5.12" },
    { label: "ClashX Pro/1.90.0", value: "ClashX Pro/1.90.0" },
    { label: "Quantumult%20X/1.0.0", value: "Quantumult%20X/1.0.0" },
    { label: "Surge/5.0", value: "Surge/5.0" },
    { label: "Shadowrocket", value: "Shadowrocket" },
    { label: "V2Box/1.0", value: "V2Box/1.0" },
    { label: "Stash/1.0", value: "Stash/1.0" },
  ];

  var STORAGE_KEY_UA = "sub-converter-custom-ua";

  function getCustomUA() {
    try { return localStorage.getItem(STORAGE_KEY_UA) || ""; } catch (e) { return ""; }
  }
  function saveCustomUA(ua) {
    try { localStorage.setItem(STORAGE_KEY_UA, ua); } catch (e) {}
  }

  // ---- 判断文本内容 ----
  function elContainsText(el, text) {
    return el.textContent && el.textContent.indexOf(text) !== -1;
  }

  function findFormItemByLabel(labelText) {
    var labels = document.querySelectorAll(".el-form-item__label");
    for (var i = 0; i < labels.length; i++) {
      if (elContainsText(labels[i], labelText)) {
        return labels[i].closest(".el-form-item");
      }
    }
    return null;
  }

  // ---- 主补丁 ----
  function patch() {
    // ========== 1. 彻底移除「后端地址」 ==========
    var backendItem = findFormItemByLabel("后端地址");
    if (backendItem) backendItem.remove();

    // ========== 2. 彻底移除「订阅短链」输出框 ==========
    var shortUrlItem = findFormItemByLabel("订阅短链");
    if (shortUrlItem) shortUrlItem.remove();

    // ========== 3. 彻底移除「生成短链接」按钮 ==========
    var buttons = document.querySelectorAll("button");
    buttons.forEach(function (btn) {
      if (elContainsText(btn, "生成短链接")) {
        btn.closest(".el-form-item").remove();
      }
    });

    // 也清理可能残留的「上传配置」按钮（可选，保留也可以）
    // buttons.forEach(function (btn) {
    //   if (elContainsText(btn, "上传配置")) {
    //     btn.closest(".el-form-item").remove();
    //   }
    // });

    // ========== 4. 注入「自定义UA」输入框 ==========
    if (!document.getElementById("custom-ua-field")) {
      var remoteFormItem = findFormItemByLabel("远程配置");
      if (remoteFormItem) {
        var savedUA = getCustomUA();
        var presetOptions = UA_PRESETS.map(function (p) {
          return '<option value="' + p.value + '">' + p.label + "</option>";
        }).join("");

        var uaDiv = document.createElement("div");
        uaDiv.id = "custom-ua-field";
        uaDiv.className = "el-form-item";
        uaDiv.style.cssText = "margin-bottom:18px;";

        uaDiv.innerHTML =
          '<label class="el-form-item__label" style="width:140px;float:left;line-height:36px;padding:0 12px 0 0;box-sizing:border-box;">自定义UA:</label>' +
          '<div class="el-form-item__content" style="margin-left:140px;">' +
            '<div style="display:flex;gap:8px;">' +
              '<select id="ua-preset-select" class="el-input__inner" style="width:200px;height:36px;">' +
                '<option value="">预设选择</option>' + presetOptions +
              '</select>' +
              '<input id="ua-custom-input" class="el-input__inner" placeholder="留空则使用客户端默认UA" value="' +
                savedUA.replace(/"/g, "&quot;") + '" style="flex:1;height:36px;" />' +
            '</div>' +
          '</div>';

        remoteFormItem.parentNode.insertBefore(uaDiv, remoteFormItem.nextSibling);

        document.getElementById("ua-preset-select").addEventListener("change", function () {
          if (this.value) {
            document.getElementById("ua-custom-input").value = this.value;
            saveCustomUA(this.value);
          }
        });
        document.getElementById("ua-custom-input").addEventListener("input", function () {
          saveCustomUA(this.value);
        });
      }
    }

    // ========== 5. 替换远程配置列表 ==========
    var app = document.getElementById("app");
    if (app && app.__vue__) {
      function patchRunning(comp) {
        if (comp.$data && comp.$data.options && comp.$data.options.remoteConfig) {
          comp.$data.options.remoteConfig = ACL4SSR_CONFIGS;
        }
        if (comp.$children) comp.$children.forEach(patchRunning);
      }
      patchRunning(app.__vue__);
    }

    // ========== 6. 拦截订阅链接，追加 ua 参数 ==========
    interceptSubUrl();
  }

  // ---- 拦截输出框，自动追加 ua ----
  function interceptSubUrl() {
    var observer = new MutationObserver(function () {
      var ua = getCustomUA();
      if (!ua) return;
      var outputs = document.querySelectorAll("input[disabled], textarea[disabled]");
      outputs.forEach(function (el) {
        var val = el.value;
        if (val && val.indexOf("/sub?") !== -1 && val.indexOf("ua=") === -1) {
          el.value = val + "&ua=" + encodeURIComponent(ua);
          el.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  // ---- 延迟执行 ----
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(patch, 500);
      setTimeout(patch, 1500);
      setTimeout(patch, 3000); // 再等一次，确保 Vue 渲染完成
    });
  } else {
    setTimeout(patch, 500);
    setTimeout(patch, 1500);
    setTimeout(patch, 3000);
  }
})();
