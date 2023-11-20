<template>
  <div id="app">
    <router-view></router-view>
  </div>
  <div>
    <h1>实施顾问考试</h1>
    <h3>
      <span class="warning-text">
        考试期间请勿刷新浏览器，否则将判定考试结束 <br />
        考试时间60分钟，总分100分
      </span>
    </h3>
    <!-- <h3>考试时间60分钟，总分100分</h3> -->

    <div v-if="!examStarted">
      <div class="button-container">
        <button @click="startExamConfirmation" class="center-button">
          开始考试
        </button>
      </div>
    </div>

    <div v-else-if="!timeExpired">
      <div class="time-container">
        <p>
          剩余时间: {{ remainingTime.minutes.toString().padStart(2, "0") }} 分
          {{ remainingTime.seconds.toString().padStart(2, "0") }} 秒
        </p>
      </div>
      <div v-for="(question, index) in questions" :key="index">
        <h2>Num. {{ index + 1 }}</h2>
        <p v-html="formatQuestion(question)"></p>
        <textarea
          v-if="index < 3"
          v-model="answers[index]"
          placeholder="请输入答案"
        ></textarea>
        <input
          v-else
          type="file"
          @change="handleImageUpload"
          accept="image/*"
        />
      </div>

      <div class="button-container">
        <button @click="submitExam">交卷</button>
      </div>
    </div>

    <div v-else>
      <h3>考试已结束</h3>
    </div>
  </div>
</template>
  
  <script>
import { ref, reactive, onMounted, watch, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router"; // 导入 useRouter

export default {
  setup() {
    const router = useRouter();
    const questions = [
      "简答题：现有某客户部署ECM项目（部署最新版ecm6.5），用户数：6000，存储数据量90T（客户提供商业对象存储、数据库mysql），文件数量预估1000w（30分）\n中间件应用不拆分部署方案服务器配置：\n中间件应用拆分部署方案服务器配置：\n中间件数据盘，实体文件存储 IO性能要求：\n客户提供的MySQL，兼容性要求：\n如何测试客户提供的s3对象存储我们是否兼容：\n对接客户数据库和对象存储的环境变量：",
      "简答题：现某客户页面报错502，请写出应急响应流程，系统的负载分析方法及分析日志路径（20分）\n应急响应流程：\n系统负载分析：\n日志分析：\n系统日志：\n服务日志：\n内核日志：\ndocker日志：\nedoc2系统资源监控日志：",
      "简答题：系统上传下载文件慢应该如何排查，使用哪些工具以及排查思路（20分）",
      "实操题：创建一个pv 绑定本地目录 /data ， 生成pvc 大小申请5G，然后pod（使用nginx镜像）挂载/tmp目录挂载pvc（30分）\n请使用vpn连接公司本地服务：192.168.123.67 root/edoc2edoc2 \n创建 PersistentVolume（PV）：\n创建 PersistentVolumeClaim（PVC）：\n创建 Pod 并挂载 PVC：\n创建完成后，在pod创建test文件写入123,然后在宿主机cat此文件，截一张图即可",
    ];
    const examName = ref("");
    const answers = ref(["", "", ""]);
    const imageDataUrl = ref("");
    const examStarted = ref(false);
    const timeExpired = ref(false);
    const examDuration = 60 * 60 * 1000;
    // const examDuration = 10 * 3 * 1000;
    const remainingTime = reactive({ minutes: 0, seconds: 0 });
    let timer = null;
    let startTime = 0;

    const startExamConfirmation = () => {
      const name = prompt("请输入您的姓名：");

      // 列出允许参加考试的姓名列表
      const allowedNames = ["尹纪晓", "温江逢", "王齐玲"];

      if (allowedNames.includes(name)) {
        examName.value = name;
        const confirmed = confirm("确定要开始考试吗？");
        if (confirmed) {
          startExam();
          localStorage.setItem("exam_started", JSON.stringify(true));
          startTime = new Date().getTime();
        }
      } else {
        alert("很抱歉，您不在允许考试的名单中。");
      }
    };

    const uploadFile = async (htmlContent, fileName, callback) => {
      const formData = new FormData();
      formData.append(
        "examAnswers",
        new Blob([htmlContent], { type: "text/html" }),
        `${fileName}_exam_answers.html`
      );

      // 在这里添加考试人姓名到 FormData
      formData.append("fileName", fileName);

      // 打印 FormData 的内容
      for (var pair of formData.entries()) {
        console.log(pair[0] + ", " + pair[1]);
      }

      try {
        const response = await fetch("http://net.vir71.cloud:8091/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          console.log("文件上传成功！");
          // 在这里添加交卷成功的提示
          alert("交卷成功！");
          callback();
        } else {
          console.error("文件上传失败:", response.statusText);
          // 在这里添加交卷失败的提示
          alert("交卷失败，请重试！");
        }
      } catch (error) {
        console.error("文件上传时出错:", error);
        // 在这里添加交卷失败的提示
        alert("交卷失败，请重试！");
      }
    };

    const startExam = () => {
      examStarted.value = true;
      timer = setInterval(updateTime, 1000);
      setTimeout(() => {
        timeExpired.value = true;
        clearInterval(timer);
      }, examDuration);
    };

    const updateTime = () => {
      const now = new Date().getTime();
      const remainingMilliseconds = examDuration - (now - startTime);

      const minutes = Math.floor(
        (remainingMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((remainingMilliseconds % (1000 * 60)) / 1000);

      remainingTime.minutes = minutes;
      remainingTime.seconds = seconds;

      if (remainingMilliseconds <= 0) {
        clearInterval(timer);
        timeExpired.value = true;
        setTimeout(() => {
          // 时间到了触发交卷
          submitExam();
          alertTimeUp();
        }, 1000);
      }
    };

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          imageDataUrl.value = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };

    const submitExam = () => {
      // 检查是否已经提交过考试
      const hasSubmitted = localStorage.getItem("exam_submitted");
      const options = {
        timeZone: "Asia/Shanghai", // 时区设置为中国标准时间
        year: "numeric",
        month: "2-digit", // 两位数字的月份
        day: "2-digit", // 两位数字的日期
        hour: "2-digit", // 两位数字的小时
        minute: "2-digit", // 两位数字的分钟
        second: "2-digit", // 两位数字的秒钟
        hour12: false, // 使用24小时制
      };

      const currentDateTime = new Date()
        .toLocaleString("en-US", options)
        .replace(/[/]/g, "-")
        .replace(/[\s,:]/g, "_");
      const fileName = `${examName.value}_${currentDateTime}_exam.html`;
      if (hasSubmitted) {
        // alert("您已经提交过考试，不能重复提交。");
        return;
      }

      // 将考试状态设置为已提交
      localStorage.setItem("exam_submitted", JSON.stringify(true));

      for (let index = 0; index < answers.value.length; index++) {
        localStorage.setItem(
          `answer_${index}`,
          JSON.stringify(answers.value[index])
        );
      }

      const htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
            <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${examName.value}的考试答案</title>
      </head>
      <body>
        <h1>${examName.value}的考试答案</h1>
            ${questions
              .map(
                (question, index) => `
                  <h2>Num. ${index + 1}</h2>
                  <p>${formatQuestion(question)}</p>
                  <p><strong>答：</strong></p>
                  <p>${formatQuestion(answers.value[index])}</p>
                `
              )
              .join("")}
            ${
              imageDataUrl.value
                ? `<img src="${imageDataUrl.value}" alt="上传的图片">`
                : ""
            }
          </body>
          </html>
        `;

      // const blob = new Blob([htmlContent], { type: "text/html" });
      // const link = document.createElement("a");

      // link.href = window.URL.createObjectURL(blob);
      // link.download = "exam_answers.html";

      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);
      // 上传文件并在回调中刷新页面
      uploadFile(htmlContent, fileName, () => {
        // 上传成功后刷新页面
        //   window.location.reload();
        // 上传成功后导航到 Congratulations 页面
        router.push({ name: "Congratulation" });
      });
    };

    const alertTimeUp = () => {
      alert("考试已结束！");
    };

    const formatQuestion = (question) => {
      return question ? question.replace(/\n/g, "<br>") : "";
    };

    watch(answers, (newAnswers) => {
      localStorage.setItem("exam_answers", JSON.stringify(newAnswers));
    });

    onMounted(() => {
      questions.forEach((_, index) => {
        const storedAnswer = localStorage.getItem(`answer_${index}`);
        if (storedAnswer) {
          try {
            answers.value[index] = JSON.parse(storedAnswer);
          } catch (error) {
            console.error(`解析 answer_${index} 时出错:`, error);
          }
        }
      });

      const storedExamStarted = localStorage.getItem("exam_started");
      if (storedExamStarted) {
        examStarted.value = JSON.parse(storedExamStarted);
        if (examStarted.value) {
          startExam();
        }
      }
    });

    onBeforeUnmount(() => {
      clearInterval(timer);
    });

    return {
      questions,
      answers,
      imageDataUrl,
      examStarted,
      timeExpired,
      remainingTime,
      startExamConfirmation,
      handleImageUpload,
      submitExam,
      formatQuestion,
    };
  },
};
</script>
  
  <style scoped>
/* 样式可以根据需要添加 */
textarea {
  width: 1111px;
  height: 204px;
}
.warning-text {
  color: red;
  font-weight: bold;
  text-align: left; /* 左对齐 */
}

h3 {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 10vh; /* 或者适当的高度值 */
}

.button-container {
  text-align: center;
}

.time-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 10vh; /* 或者适当的高度值 */
  }
</style>



  