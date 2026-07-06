// =========================================
// Evergreen Lawn & Landscape
// Demo Website
// ClearPeak Web
// =========================================

// 页面加载完成
document.addEventListener("DOMContentLoaded", () => {

    console.log("Evergreen Lawn website loaded.");

    //---------------------------------------
    // 导航平滑滚动
    //---------------------------------------

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {

        anchor.addEventListener("click", function (e) {

            const target = document.querySelector(this.getAttribute("href"));

            if (!target) return;

            e.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });

    //---------------------------------------
    // Header 滚动阴影
    //---------------------------------------

    const header = document.querySelector(".header");

    window.addEventListener("scroll", () => {

        if (window.scrollY > 60) {

            header.style.boxShadow = "0 8px 30px rgba(0,0,0,.12)";
            header.style.background = "#ffffff";

        } else {

            header.style.boxShadow = "0 2px 12px rgba(0,0,0,.06)";
            header.style.background = "#ffffff";

        }

    });

    //---------------------------------------
    // 按钮点击动画
    //---------------------------------------

    document.querySelectorAll(".btn, button").forEach(btn => {

        btn.addEventListener("click", function () {

            this.style.transform = "scale(.96)";

            setTimeout(() => {

                this.style.transform = "scale(1)";

            },120);

        });

    });

    //---------------------------------------
    // 联系表单（Demo）
    //---------------------------------------

    const form = document.querySelector("form");

    if(form){

        form.addEventListener("submit",(e)=>{

            e.preventDefault();

            alert("Thank you! This is a demo website. Form submission is disabled.");

        });

    }

});
