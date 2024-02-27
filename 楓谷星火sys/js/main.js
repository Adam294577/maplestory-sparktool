window.onload = () => {
  const { createApp, ref, reactive, computed, watch, onMounted, onUpdated } =
    Vue;
  const App = {
    setup() {
      // 篩選 裝備、星火、職業、目標資料
      const EquipTypeData = reactive({ data: [] });
      const weaponTypeData = reactive({ data: [] });
      const SparkTypeData = computed(() => {
        let Usedata = EquipTypeData.data ?? [];
        if (Usedata.length === 0) return [];
        let result = Usedata.filter((item) => {
          if (EquipType.value.is === item.key) {
            return item;
          }
        });
        handSparkType(null, SparkType.value.is, result[0].defaultData.spark);
        return result[0].sparkArr;
      });
      const JobTypeData = computed(() => {
        let Usedata = EquipTypeData.data ?? [];
        if (Usedata.length === 0) return [];
        let result = Usedata.filter((item) => {
          if (EquipType.value.is === item.key) {
            return item;
          }
        });
        handJobType(null, JobType.value.is, result[0].defaultData.job);
        return result[0].jobArr;
      });
      const AimTypeData = computed(() => {
        let Usedata = EquipTypeData.data ?? [];
        let SingleFilter = ["請選擇裝備類型", "創世", "頂培", "滅龍"];
        if (Usedata.length === 0) return [];
        let dataFilter = Usedata.filter((item) => {
          if (EquipType.value.is === item.key) {
            return item;
          }
        });
        UseImgItem.value.is = dataFilter[0].defaultData.Img;
        if (SingleFilter.includes(EquipType.value.is)) {
          handAimType(null, AimType.value.is, dataFilter[0].defaultData.aim);
          return dataFilter[0].aimArr;
        } else {
          // 二次篩選目標內容
          let result = dataFilter[0].aimArr.filter((item) => {
            if (item.key === UseImgItem.value.is) {
              return item;
            }
          });
          handAimType(null, AimType.value.is, result[0].default);
          return result[0].aim;
        }
      });
      const EquipType = ref({ is: "請選擇裝備類型" });
      const SparkType = ref({ is: "請選擇星火類型" });
      const JobType = ref({ is: "-" });
      const AimType = ref({ is: "-" });
      const UseImgItem = ref({ is: "-" });
      const weaponType = ref({ is: 6 });
      const UseSparkFrame = computed(() => {
        let key = SparkType.value.is;
        // console.log(key);
        let baseURL = "./img/";
        return `${baseURL}${key}框.png`;
      });
      const handEquipType = (el = null, key) => {
        EquipTypeData.data.forEach((item) => {
          if (item.key === key) {
            EquipType.value.is = item.key;
            SparkType.value.is = item.spark;
            SparkType.value.is = item.spark;
            JobType.value.is = item.job;
            AimType.value.is = item.aim;
            UseImgItem.value.is = item.Img;
          }
        });
      };
      const handSparkType = (el = null, key, defaultKey) => {
        if (key !== undefined) {
          SparkType.value.is = key;
        } else {
          SparkType.value.is = defaultKey;
        }
      };
      const handJobType = (el = null, key, defaultKey) => {
        if (key !== undefined) {
          JobType.value.is = key;
        } else {
          JobType.value.is = defaultKey;
        }
      };
      const handAimType = (el = null, key, defaultKey) => {
        if (key !== undefined) {
          AimType.value.is = key;
        } else {
          AimType.value.is = defaultKey;
        }
      };
      // 切換圖片 &更新資料

      // 星火運作流程
      const SparkLvRate = reactive({ data: [] });
      const SparkAttrData = reactive({ data: [] });

      const handCreateDice = () => {
        let diceCountArr = [40, 80, 95, 100];
        let min = 0.01;
        let max = 100;
        let randomNum = (Math.random() * (max - min) + min).toFixed(2);
        if (randomNum <= diceCountArr[0]) return 1;
        if (randomNum <= diceCountArr[1]) return 2;
        if (randomNum <= diceCountArr[2]) return 3;
        if (randomNum <= diceCountArr[3]) return 4;
      };

      // 随机生成星火不重复的索引
      function getSparkAttrIndexes(length, count) {
        const indexes = [];
        while (indexes.length < count) {
          const randomIndex = Math.floor(Math.random() * length);
          //   console.log(randomIndex);
          if (!indexes.includes(randomIndex)) {
            indexes.push(randomIndex);
          }
        }
        return indexes;
      }
      // 生成各星火的等級
      function getSparkLv(count) {
        console.log(5207);
        if (SparkType.value.is === "請選擇星火類型") {
          console.warn("請選擇星火類型");
          return [];
        }
        let result = [];
        const IsGeneralEquip = ["頂培", "滅龍", "琉璃"];
        console.log(SparkLvRate.data);
        SparkType.value.is = "覺醒的輪迴星火";
        UseImgItem.value.is = "雙手劍";
        const SparkRateArr = SparkLvRate.data.filter((item) => {
          if (item.key === SparkType.value.is) return item;
        });
        // console.log(SparkRateArr[0].rate);
        // return []
        while (result.length < count) {
          const min = 0.01;
          const max = 100;
          const randomNum = (Math.random() * (max - min) + min).toFixed(2);
          console.log(randomNum);
          if (randomNum <= SparkRateArr[0].rate[0]) {
            result.push(1);
            continue;
          }
          if (randomNum <= SparkRateArr[0].rate[1]) {
            result.push(2);
            continue;
          }
          if (randomNum <= SparkRateArr[0].rate[2]) {
            result.push(3);
            continue;
          }
          if (randomNum <= SparkRateArr[0].rate[3]) {
            result.push(4);
            continue;
          }
          if (randomNum <= SparkRateArr[0].rate[4]) {
            result.push(5);
            continue;
          }
        }
        if (
          SparkType.value.is === "覺醒的輪迴星火" &&
          !IsGeneralEquip.includes(UseImgItem.value.is)
        ) {
          result = result.map((val) => {
            val += 2;
            return val;
          });
        }
        return result;
      }

      const DiceSparkOnce = () => {
        // 預設為Boss裝備 選取4排星火潛能
        let CreateDice = 4;
        const IsGeneralEquip = ["頂培", "滅龍", "琉璃"];
        if (IsGeneralEquip.includes(UseImgItem.value.is)) {
          CreateDice = handCreateDice();
          // console.log(CreateDice);
        }
        const SparkAttrIdx = getSparkAttrIndexes(19, CreateDice);
        console.log("星火屬性索引值", SparkAttrIdx);
        const SparkLvArr = getSparkLv(CreateDice);
        console.log("星火屬性等級", SparkLvArr);
      };
      setTimeout(() => {
        // DiceSparkOnce()
      }, 1000);

      onMounted(() => {
        const api = axios.create({
          baseURL: "./api/",
        });
        const PromiseArr = [
          api.get("equipType.json"),
          api.get("ImgData.json"),
          api.get("weaponType.json"),
          api.get("SparkLvRate.json"),
        ];

        const init = async () => {
          try {
            const res = await Promise.all(PromiseArr);
            EquipTypeData.data = res[0].data.data;
            weaponTypeData.data = res[2].data.data;
            SparkLvRate.data = res[3].data.data;
          } catch {
            console.error("沒接到API");
          }
        };
        init();
      });
      return {
        // 篩選 裝備、星火、職業、目標資料
        SparkTypeData,
        JobTypeData,
        AimTypeData,

        EquipType,
        SparkType,
        JobType,
        AimType,
        handEquipType,
        handSparkType,
        handJobType,

        UseSparkFrame,
      };
    },
  };
  createApp(App).mount("#app");
};
