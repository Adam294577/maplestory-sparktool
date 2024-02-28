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
        handJobType(null, JobType.value.is);
        return result[0].jobArr;
      });
      const AimTypeData = computed(() => {
        let Usedata = EquipTypeData.data ?? [];
        let SingleFilter = ["請選擇裝備類型", "創世", "頂培", "滅龍"];
        if (Usedata.length === 0) return [];
        // 特殊狀況: 當是神之子創世的時候
        // if (UseImgItem.value.is.alt === "琉璃") {

        // }
        let dataFilter = Usedata.filter((item) => {
          if (EquipType.value.is === item.key) {
            return item;
          }
        });
        handImgItem(null, UseImgItem.value.is, dataFilter[0].defaultData.Img);
        if (SingleFilter.includes(EquipType.value.is)) {
          handAimType(null, AimType.value.is, dataFilter[0].defaultData.aim);
          return dataFilter[0].aimArr;
        } else {
          // 二次篩選目標內容
          // console.log("二次篩選使用的裝備圖", UseImgItem.value.is);
          let altKey = "";
          if (UseImgItem.value.is.type === "防具") {
            altKey = UseImgItem.value.is.alt.substr(0, 2);
          }
          if (UseImgItem.value.is.type === "漆黑") {
            altKey = UseImgItem.value.is.alt;
          }
          // console.log(altKey);
          let result = dataFilter[0].aimArr.filter((item) => {
            if (item.key === altKey) {
              return item;
            }
          });
          if (result.length === 0) return [];
          // console.log("二次篩選", result);
          // console.log("二次篩選預設值", result[0].default);
          handAimType(null, AimType.value.is, result[0].default);

          return result[0].aim;
        }
      });
      const EquipType = ref({ is: "請選擇裝備類型" });
      const SparkType = ref({ is: "請選擇星火類型" });
      const JobType = ref({ is: "-" });
      const AimType = ref({ is: "-" });
      const UseImgItem = ref({
        is: {
          type: "請選擇裝備類型",
          job: ["-"],
          url: "-",
          alt: "-",
        },
      });
      const DefaultJobChangeData = reactive({ data: [] });
      const weaponType = ref({ is: 6 });
      const UseSparkFrame = computed(() => {
        let key = SparkType.value.is;
        // console.log(key);
        let baseURL = "./img/";
        return `${baseURL}${key}框.png`;
      });
      const handEquipType = (el = null, key) => {
        if (SparkSysBool.value) return;
        EquipTypeData.data.forEach((item) => {
          if (item.key === key) {
            // console.log(item.defaultData.aim);
            EquipType.value.is = item.key;
            handSparkType(null, item.defaultData.spark);
            if (EquipType.value.is !== "請選擇裝備類型") {
              JobType.value.is = "劍士";
            }
            handAimType(null, item.defaultData.aim);
            UseImgItem.value.is = item.defaultData.Img;
          }
        });
      };
      const handSparkType = (el = null, key, defaultKey) => {
        if (SparkSysBool.value) return;
        if (key !== undefined) {
          SparkType.value.is = key;
        } else {
          SparkType.value.is = defaultKey;
        }
      };
      const handJobType = (el = null, key) => {
        if (SparkSysBool.value) return;
        JobType.value.is = key;
        DefaultJobChange();
      };
      const DefaultJobChange = () => {
        if (JobType.value.is === "-") return;
        if (EquipType.value.is === "請選擇裝備類型") return;
        if (UseImgItem.value.is.job.includes(JobType.value.is)) return;
        let data = DefaultJobChangeData.data;
        let Mapdata = Object.groupBy(data, ({ type }) => type);
        if (Mapdata[EquipType.value.is] === undefined) return;
        Mapdata[EquipType.value.is].forEach((item) => {
          if (JobType.value.is === item.job) handImgItem(null, item.Img.url);
        });
      };

      const handAimType = (el = null, key, defaultKey) => {
        if (SparkSysBool.value) return;
        if (key !== undefined) {
          AimType.value.is = key;
        } else {
          AimType.value.is = defaultKey;
        }
      };

      // 裝備圖
      const EquipImgData = reactive({ data: [] });
      const EquipImgRender = computed(() => {
        let data = EquipImgData.data ?? [];
        if (data.length === 0) return [];
        if (EquipType.value.is === "請選擇裝備類型") return [];
        let MapEquipdata = Object.groupBy(data, ({ type }) => type);
        let MapJobData = MapEquipdata[EquipType.value.is].filter((item) => {
          if (item.job.includes(JobType.value.is)) {
            return item;
          }
        });
        // console.log("職業篩選後:", MapJobData);
        return MapJobData;
      });
      const handImgItem = (el = null, key, defaultkey) => {
        if (SparkSysBool.value) return;
        if (key !== undefined) {
          // 給 EquipImgRender轉換圖片時間
          setTimeout(() => {
            EquipImgRender.value.forEach((item) => {
              if (item.url === key) {
                UseImgItem.value.is = item;
                // 切換圖片時 依據不同的等級 預設目標也更新
                if (item.type === "防具") {
                  const newAimTxt = item.alt.substr(0, 2);
                  if (newAimTxt === "航海") handAimType(null, "42主屬以上");
                  if (newAimTxt === "神秘") handAimType(null, "51+3%主屬以上");
                  if (newAimTxt === "永恆") handAimType(null, "57+3%主屬以上");
                }
                if (item.type === "漆黑") {
                  const newAimTxt = item.alt;
                  const Lv200Arr = ["夢幻", "指揮官"];
                  Lv200Arr.includes(newAimTxt)
                    ? handAimType(null, "51+3%主屬以上")
                    : handAimType(null, "42+3%主屬以上");
                }
              }
            });
          }, 100);
        } else {
          console.log("預設圖", defaultkey);
          UseImgItem.value.is = defaultkey;
        }
      };

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

      // 随机生成星火不重复的索引並傳回星火套用屬性
      function getSparkAttr(length, count) {
        const indexes = [];
        let Attrdata = SparkAttrData.data;
        let result = [];
        if (EquipType.value.is === "創世") {
          Attrdata = Attrdata[0].List;
        } else {
          Attrdata = Attrdata[1].List;
        }
        // console.log("屬性資料:", Attrdata);
        while (indexes.length < count) {
          const randomIndex = Math.floor(Math.random() * length);
          //   console.log(randomIndex);
          if (!indexes.includes(randomIndex)) {
            indexes.push(randomIndex);
          }
        }
        Attrdata.forEach((item) => {
          if (indexes.includes(item.idx)) {
            result.push(item.key);
          }
        });
        return result;
      }
      // 生成各星火的等級
      function getSparkLv(count) {
        if (SparkType.value.is === "請選擇星火類型") {
          console.warn("請選擇星火類型");
          return [];
        }
        let result = [];
        const IsGeneralEquip = ["頂培", "滅龍", "琉璃"];
        const SparkRateArr = SparkLvRate.data.filter((item) => {
          if (item.key === SparkType.value.is) return item;
        });
        // console.log(SparkRateArr[0].rate);
        // return []
        while (result.length < count) {
          const min = 0.01;
          const max = 100;
          const randomNum = (Math.random() * (max - min) + min).toFixed(2);
          // console.log(randomNum);
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
          !IsGeneralEquip.includes(UseImgItem.value.is.alt)
        ) {
          result = result.map((val) => {
            val += 2;
            return val;
          });
        }
        return result;
      }
      const SparkResult = ref({ is: [] });
      const SparkSysBool = ref(false);
      const DiceSparkOnce = () => {
        if (SparkSysBool.value) return console.log("執行中 不可再點");
        SparkSysBool.value = true;
        // 預設為Boss裝備 選取4排星火潛能
        let CreateDice = 4;

        const IsGeneralEquip = ["頂培", "滅龍", "琉璃"];
        if (IsGeneralEquip.includes(UseImgItem.value.is.alt)) {
          CreateDice = handCreateDice();
          // console.log(CreateDice);
        }
        const SparkLvArr = getSparkLv(CreateDice);
        if (SparkLvArr.length === 0) return;
        const SparkAttrArr = getSparkAttr(19, CreateDice);
        // console.log("星火屬性索引值", SparkAttrArr);
        // console.log("星火屬性等級", SparkLvArr);
        SparkResult.value.is = [];
        SparkResultRender.value = [];
        for (let i = 0; i < SparkAttrArr.length; i++) {
          SparkResult.value.is.push({
            Attr: SparkAttrArr[i],
            Lv: SparkLvArr[i],
          });
        }
        // console.log(SparkResult.value.is);
        CalculateSparkVal();
      };
      const SparkResultRender = ref([]);
      const SparkPlusRule = reactive({ data: [] });
      const CalculateSparkVal = () => {
        let oneAttr = 0;
        let twoAttr = 0;
        let defence = 0;
        let pp = 0;
        if (EquipType.value.is === "創世") {
          oneAttr = 11;
          twoAttr = 6;
          defence = 6;
          pp = 600;
        } else {
          // console.log(SparkPlusRule.data);
          SparkPlusRule.data.forEach((item) => {
            if (item.key === UseImgItem.value.is.Lv) {
              oneAttr = item.plusRule.oneAttr;
              twoAttr = item.plusRule.twoAttr;
              defence = item.plusRule.defence;
              pp = item.plusRule.pp;
            }
          });
        }
        let attrdata = [
          { idx: 0, title: "力量", key: "STR", val: 0 },
          { idx: 1, title: "敏捷", key: "DEX", val: 0 },
          { idx: 2, title: "智力", key: "INT", val: 0 },
          { idx: 3, title: "幸運", key: "LUK", val: 0 },
          { idx: 4, title: "套用等級減少", key: "LVREDUCE", val: 0 },
          { idx: 5, title: "MaxHp", key: "MAXHP", val: 0 },
          { idx: 6, title: "MaxMp", key: "MAXMP", val: 0 },
          { idx: 7, title: "防禦力", key: "DEFENCE", val: 0 },
          { idx: 8, title: "移動速度", key: "MOVE", val: 0 },
          { idx: 9, title: "跳躍力", key: "JUMP", val: 0 },
          { idx: 10, title: "BOSS攻擊傷害", key: "BOSS", val: 0 },
          { idx: 11, title: "總傷害", key: "DMG", val: 0 },
          { idx: 12, title: "攻擊力", key: "ATK", val: 0 },
          { idx: 13, title: "魔法攻擊力", key: "MAGIC", val: 0 },
          { idx: 14, title: "全屬性", key: "ALLSTAT", val: 0 },
        ];
        SparkResult.value.is.forEach((item) => {
          if (item.Attr === "STR") {
            attrdata[0].val += item.Lv * oneAttr;
          }
          if (item.Attr === "DEX") {
            attrdata[1].val += item.Lv * oneAttr;
          }
          if (item.Attr === "INT") {
            attrdata[2].val += item.Lv * oneAttr;
          }
          if (item.Attr === "LUK") {
            attrdata[3].val += item.Lv * oneAttr;
          }
          if (item.Attr === "STRDEX") {
            attrdata[0].val += item.Lv * twoAttr;
            attrdata[1].val += item.Lv * twoAttr;
          }
          if (item.Attr === "STRINT") {
            attrdata[0].val += item.Lv * twoAttr;
            attrdata[2].val += item.Lv * twoAttr;
          }
          if (item.Attr === "STRLUK") {
            attrdata[0].val += item.Lv * twoAttr;
            attrdata[3].val += item.Lv * twoAttr;
          }
          if (item.Attr === "DEXINT") {
            attrdata[1].val += item.Lv * twoAttr;
            attrdata[2].val += item.Lv * twoAttr;
          }
          if (item.Attr === "DEXLUK") {
            attrdata[1].val += item.Lv * twoAttr;
            attrdata[3].val += item.Lv * twoAttr;
          }
          if (item.Attr === "穿戴等級減少") attrdata[4].val += item.Lv * 5;
          if (item.Attr === "最大HP") attrdata[5].val += item.Lv * pp;
          if (item.Attr === "最大MP") attrdata[6].val += item.Lv * pp;
          if (item.Attr === "防禦力") attrdata[7].val += item.Lv * defence;
          if (item.Attr === "攻擊力" && EquipType.value.is !== "創世")
            attrdata[12].val += item.Lv * 1;
          if (item.Attr === "魔力" && EquipType.value.is !== "創世")
            attrdata[12].val += item.Lv * 1;
          if (item.Attr === "攻擊力" && EquipType.value.is === "創世") {
            console.log("創世攻擊表格");
            return;
          }
          if (item.Attr === "魔力" && EquipType.value.is === "創世") {
            console.log("創世攻擊表格");
            return;
          }
          if (item.Attr === "移動速度") attrdata[8].val += item.Lv * 1;
          if (item.Attr === "跳躍力") attrdata[9].val += item.Lv * 1;
          if (item.Attr === "BOSS") attrdata[10].val += item.Lv * 2;
          if (item.Attr === "傷害") attrdata[11].val += item.Lv * 1;
          if (item.Attr === "全屬") attrdata[14].val += item.Lv * 1;
        });
        // console.log("計算後的資料:", attrdata);
        attrdata.forEach((item) => {
          let msgTitle = "";
          let msgVal = "";
          if (item.val !== 0) {
            msgTitle = item.title;
            msgVal = `+${item.val}`;
            if (item.title === "全屬性") {
              msgVal = `+${item.val}%`;
            }
            if (item.title === "套用等級減少") {
              msgVal = `-${item.val}`;
            }
            SparkResultRender.value.push({ title: msgTitle, val: msgVal });
          }
        });
        // console.log("顯示結果", SparkResultRender.value);
        if (true) {
          console.log("目標達成");
          SparkSysBool.value = false;
        }
      };
      onMounted(() => {
        const api = axios.create({
          baseURL: "./api/",
        });
        const PromiseArr = [
          api.get("equipType.json"),
          api.get("ImgData.json"),
          api.get("weaponType.json"),
          api.get("SparkLvRate.json"),
          api.get("DefaultJobChangeImg.json"),
          api.get("SparkAttrData.json"),
          api.get("SparkPlusRule.json"),
        ];

        const init = async () => {
          try {
            const res = await Promise.all(PromiseArr);
            EquipTypeData.data = res[0].data.data;
            EquipImgData.data = res[1].data.data;
            weaponTypeData.data = res[2].data.data;
            SparkLvRate.data = res[3].data.data;
            DefaultJobChangeData.data = res[4].data.data;
            SparkAttrData.data = res[5].data.data;
            SparkPlusRule.data = res[6].data.data;
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
        // 裝備圖
        UseImgItem,
        EquipImgRender,
        handImgItem,
        // 星火運算
        UseSparkFrame,
        DiceSparkOnce,
        SparkResultRender,
        SparkSysBool,
      };
    },
  };
  createApp(App).mount("#app");
};
