window.onload = () => {
  const { createApp, ref, reactive, computed, watch, onMounted, onUpdated } =
    Vue;
  const App = {
    setup() {
      // 篩選 裝備、星火、職業、目標資料
      const HpArrData = reactive({
        is: ["T4HP以上", "T5HP以上", "T6HP以上", "T7HP"],
      });
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
      const handHpArrData = (arr) => {
        const IsGeneralEquip = ["頂耳", "頂腰", "頂鍊", "滅龍"];
        if (IsGeneralEquip.includes(UseImgItem.value.is.alt)) {
          let idx = arr.indexOf("T6HP以上");
          arr = arr.slice(0, idx);
        }
        if (arr.includes("T4HP以上") && JobType.value.is === "劍士") return arr;
        if (arr.includes("T4HP以上") && JobType.value.is !== "劍士") {
          let idx = arr.indexOf("T4HP以上");
          arr = arr.slice(0, idx);
          return arr;
        }
        let orginArr = [...arr];
        if (EquipType.value.is === "創世") return orginArr;
        if (JobType.value.is !== "劍士") return orginArr;
        // 新增HP目標
        if (JobType.value.is === "劍士") {
          arr = [...arr, ...HpArrData.is];
          // 頂培、滅龍 最高T5
          if (IsGeneralEquip.includes(UseImgItem.value.is.alt)) {
            let idx = arr.indexOf("T6HP以上");
            arr = arr.slice(0, idx);
          }
          return arr;
        }
      };
      const AimTypeData = computed(() => {
        let Usedata = EquipTypeData.data ?? [];
        let SingleFilter = ["請選擇裝備類型", "創世", "頂培", "滅龍"];
        if (Usedata.length === 0) return [];
        // 特殊狀況: 當選擇神之子創世的時候
        if (UseImgItem.value.is.alt === "琉璃") {
          handAimType(null, AimType.value.is, "4B+T3攻");
          return ["3總+T3攻", "4B+T3攻", "6B+T3攻", "T4攻以上"];
        }
        let dataFilter = Usedata.filter((item) => {
          if (EquipType.value.is === item.key) {
            return item;
          }
        });
        handImgItem(null, UseImgItem.value.is, dataFilter[0].defaultData.Img);
        if (SingleFilter.includes(EquipType.value.is)) {
          handAimType(null, AimType.value.is, dataFilter[0].defaultData.aim);
          dataFilter[0].aimArr = handHpArrData(dataFilter[0].aimArr);
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
          result[0].aim = handHpArrData(result[0].aim);
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
      const weaponType = ref({
        is: {
          idx: 5,
          weapon: ["單手劍", "單手斧", "單手棍", "手杖", "弩", "太刀"],
          atk: [20, 40, 59, 87, 119, 157, 201],
        },
      });
      const WeaponTypeHint = ref({ key: "T3", val: "123" });
      const HPTypeHint = ref({ key: "T4", val: 207, show: false });
      const UseSparkFrame = computed(() => {
        let key = SparkType.value.is;
        // console.log(key);
        let baseURL = "./img/";
        return `${baseURL}${key}框.png`;
      });
      const handEquipType = (el = null, key) => {
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
        if (key !== undefined) {
          SparkType.value.is = key;
        } else {
          SparkType.value.is = defaultKey;
        }
      };
      const handJobType = (el = null, key) => {
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
        HPTypeHint.value.show = false;
        if (key !== undefined) {
          AimType.value.is = key;
          // 創世武器切換目標時 ， 更新提示詞
          if (EquipType.value.is === "創世") {
            handWeaponType();
            if (key === "6B+T3攻" || key === "6B+T3攻+T3有用") {
              WeaponTypeHint.value.key = "T3";
              WeaponTypeHint.value.val = weaponType.value.is.atk[2];
            }
            if (key === "6B+T4攻以上" || key === "T4攻以上") {
              WeaponTypeHint.value.key = "T4";
              WeaponTypeHint.value.val = weaponType.value.is.atk[3];
            }
            if (key === "T5攻以上") {
              WeaponTypeHint.value.key = "T5";
              WeaponTypeHint.value.val = weaponType.value.is.atk[4];
            }
            if (key === "T6攻以上") {
              WeaponTypeHint.value.key = "T6";
              WeaponTypeHint.value.val = weaponType.value.is.atk[5];
              5;
            }
            if (key === "T7攻") {
              WeaponTypeHint.value.key = "T7";
              WeaponTypeHint.value.val = weaponType.value.is.atk[6];
            }
          }
          // 目標為HP時  顯示HP提示詞
          if (EquipType.value.is !== "創世" && JobType.value.is === "劍士") {
            if (key === "T4HP以上") {
              HPTypeHint.value.show = true;
              HPTypeHint.value.key = "T4";
              SparkPlusRule.data.forEach((item) => {
                if (item.key === UseImgItem.value.is.Lv) {
                  HPTypeHint.value.val = item.plusRule.pp * 4;
                }
              });
            }
            if (key === "T5HP以上") {
              HPTypeHint.value.show = true;
              HPTypeHint.value.key = "T5";
              SparkPlusRule.data.forEach((item) => {
                if (item.key === UseImgItem.value.is.Lv) {
                  HPTypeHint.value.val = item.plusRule.pp * 5;
                }
              });
            }
            if (key === "T6HP以上") {
              HPTypeHint.value.show = true;
              HPTypeHint.value.key = "T6";
              SparkPlusRule.data.forEach((item) => {
                if (item.key === UseImgItem.value.is.Lv) {
                  HPTypeHint.value.val = item.plusRule.pp * 6;
                }
              });
            }
            if (key === "T7HP") {
              HPTypeHint.value.show = true;
              HPTypeHint.value.key = "T7";
              SparkPlusRule.data.forEach((item) => {
                if (item.key === UseImgItem.value.is.Lv) {
                  HPTypeHint.value.val = item.plusRule.pp * 7;
                }
              });
            }
          }
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
        if (SparkAimBool.value) return;
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
                  if (newAimTxt === "神秘") handAimType(null, "69主屬以上");
                  if (newAimTxt === "永恆") handAimType(null, "78主屬以上");
                }
                if (item.type === "漆黑") {
                  const newAimTxt = item.alt;
                  const Lv200Arr = ["夢幻", "指揮官"];
                  Lv200Arr.includes(newAimTxt)
                    ? handAimType(null, "69主屬以上")
                    : handAimType(null, "57主屬以上");
                }
                if (item.type === "創世") {
                  if (item.alt === "琉璃") {
                    handAimType(null, "4B+T3攻");
                    SparkType.value.is = "永遠的輪迴星火";
                  } else {
                    handAimType(null, "6B+T3攻");
                    SparkType.value.is = "覺醒的輪迴星火";
                  }
                }
              }
            });
          }, 100);
        } else {
          console.log("預設圖", defaultkey);
          UseImgItem.value.is = defaultkey;
        }
      };
      const handWeaponType = () => {
        weaponTypeData.data.forEach((item) => {
          if (item.weapon.includes(UseImgItem.value.is.alt))
            weaponType.value.is = item;
        });
        // console.log(weaponType.value.is);
      };
      // 等值換算
      const AllSTATtoATK = ref(5.3);
      const MAINSTATtoATK = ref(0.5);
      const BOSStoATK = ref(5.5);
      const AllSTATtoMAINSTAT = ref(9.5);
      const SUBtoMAINSTAT = ref(0.07);
      const ATKtoMAINSTAT = ref(2);

      // 星火運作流程
      const SparkLvRate = reactive({ data: [] });
      const SparkAttrData = reactive({ data: [] });
      const hasSparkAnimate = ref(false);
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
        const IsGeneralEquip = ["頂耳", "頂腰", "頂鍊", "滅龍", "琉璃"];
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
      const SparkAimBool = ref(false);
      const SparkGoal = ref({ key: "stat", is: 0 });
      const SparkCount = ref(0);
      const SparkCountRender = computed(() => {
        // console.log("水溝數", SparkCount.value);
        if (SparkCount.value === 0) {
          return false;
        } else {
          if (SparkAimBool.value) {
            return `已用了 ${SparkCount.value}科 ${SparkType.value.is} 洗到了 ^_^`;
          }
          if (!SparkAimBool.value) {
            return `已用了 ${SparkCount.value}科 ${SparkType.value.is} 水溝了 T_T`;
          }
        }
      });

      const handSparkGoal = () => {
        if (EquipType.value.is === "創世") {
          SparkGoal.value.key = "atk";
          if (AimType.value.is === "3總+T3攻") {
            SparkGoal.value.is = 3 * BOSStoATK.value + WeaponTypeHint.value.val;
          }
          if (AimType.value.is === "4B+T3攻") {
            SparkGoal.value.is = 4 * BOSStoATK.value + WeaponTypeHint.value.val;
          }
          if (
            AimType.value.is === "6B+T3攻" ||
            AimType.value.is === "6B+T4攻"
          ) {
            SparkGoal.value.is = 6 * BOSStoATK.value + WeaponTypeHint.value.val;
          }
          if (AimType.value.is === "6B+T3攻+T3有用") {
            // 假設T3有用為 T3主屬(+33)作為目標
            SparkGoal.value.is =
              33 * MAINSTATtoATK.value +
              6 * BOSStoATK.value +
              WeaponTypeHint.value.val;
          }
          if (
            AimType.value.is === "T4攻以上" ||
            AimType.value.is === "T5攻以上" ||
            AimType.value.is === "T6攻以上" ||
            AimType.value.is === "T7攻"
          ) {
            SparkGoal.value.is = WeaponTypeHint.value.val;
          }
        } else if (HpArrData.is.includes(AimType.value.is)) {
          SparkGoal.value.key = "hp";
          SparkGoal.value.is = HPTypeHint.value.val;
        } else {
          if (AimType.value.is === "32主屬以上") SparkGoal.value.is = 32;
          if (AimType.value.is === "37主屬以上") SparkGoal.value.is = 37;
          if (AimType.value.is === "40主屬以上") SparkGoal.value.is = 40;
          if (AimType.value.is === "42主屬以上") SparkGoal.value.is = 42;
          if (AimType.value.is === "47主屬以上") SparkGoal.value.is = 47;
          if (AimType.value.is === "48主屬以上") SparkGoal.value.is = 48;
          if (AimType.value.is === "51主屬以上") SparkGoal.value.is = 51;
          if (AimType.value.is === "69主屬以上") SparkGoal.value.is = 69;
          if (AimType.value.is === "57主屬以上") SparkGoal.value.is = 57;
          if (AimType.value.is === "78主屬以上") SparkGoal.value.is = 78;
          if (AimType.value.is === "42+3%主屬以上")
            SparkGoal.value.is = 42 + AllSTATtoMAINSTAT.value * 3;
          if (AimType.value.is === "51+3%主屬以上")
            SparkGoal.value.is = 51 + AllSTATtoMAINSTAT.value * 3;
          if (AimType.value.is === "57+3%主屬以上")
            SparkGoal.value.is = 57 + AllSTATtoMAINSTAT.value * 3;
          if (AimType.value.is === "69+3%主屬以上")
            SparkGoal.value.is = 69 + AllSTATtoMAINSTAT.value * 3;
          if (AimType.value.is === "78+3%主屬以上")
            SparkGoal.value.is = 78 + AllSTATtoMAINSTAT.value * 3;
          if (JobType.value.is === "劍士") SparkGoal.value.key = "STR";
          if (JobType.value.is === "法師") SparkGoal.value.key = "INT";
          if (JobType.value.is === "弓箭手") SparkGoal.value.key = "DEX";
          if (JobType.value.is === "盜賊") SparkGoal.value.key = "LUK";
          if (JobType.value.is === "海盜力") SparkGoal.value.key = "STR";
          if (JobType.value.is === "海盜敏") SparkGoal.value.key = "DEX";
        }
        // console.log("最後制定目標:", SparkGoal.value);
      };
      const checkSparkList = () => {
        let i = 0;
        if (EquipType.value.is === "請選擇裝備類型") i++;
        if (SparkType.value.is === "請選擇星火類型") i++;
        if (JobType.value.is === "-") i++;
        if (AimType.value.is === "-") i++;
        if (isNaN(AllSTATtoATK.value)) i++;
        if (isNaN(BOSStoATK.value)) i++;
        if (isNaN(AllSTATtoMAINSTAT.value)) i++;
        if (isNaN(SUBtoMAINSTAT.value)) i++;
        if (isNaN(ATKtoMAINSTAT.value)) i++;
        if (isNaN(MAINSTATtoATK.value)) i++;
        if (IsTwoSubStats.value === true && JobType.value.is !== "盜賊") i++;
        if (SparkType.value.is !== "覺醒的輪迴星火") {
          const disableArr = [
            "6B+T4攻以上",
            "T4攻以上",
            "T5攻以上",
            "T6攻以上",
            "T7攻",
          ];
          if (disableArr.includes(AimType.value.is)) i++;
          if (HpArrData.is.includes(AimType.value.is)) i++;
        }
        if (
          JobType.value.is !== "劍士" &&
          HpArrData.is.includes(AimType.value.is)
        )
          i++;
        i > 0 ? (checkAlertBool.value = true) : (checkAlertBool.value = false);
      };
      const checkAlertBool = ref(false);
      const checkAlert = computed(() => {
        if (checkAlertBool.value) return `選單設定有誤 請確認`;
        if (!checkAlertBool.value) return "";
      });
      const DiceSparkOnce = () => {
        handSparkGoal();
        SparkCount.value++;
        SparkAimBool.value = false;
        // 預設為Boss裝備 選取4排星火潛能
        let CreateDice = 4;
        const IsGeneralEquip = ["頂耳", "頂腰", "頂鍊", "滅龍", "琉璃"];
        if (IsGeneralEquip.includes(UseImgItem.value.is.alt))
          CreateDice = handCreateDice();
        const SparkLvArr = getSparkLv(CreateDice);
        if (SparkLvArr.length === 0) return;
        const SparkAttrArr = getSparkAttr(19, CreateDice);
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
        setTimeout(() => {
          window.scrollTo({ top: 9999 });
        }, 1);
      };
      const SparkAnimateBool = ref(false);
      const SparkSuccessBtn = computed(() => {
        if (
          SparkType.value.is === "覺醒的輪迴星火" &&
          EquipType.value.is === "頂培" &&
          AimType.value.is === "48主屬以上"
        )
          return "點30000次";
        if (SparkType.value.is === "覺醒的輪迴星火") return "點到有";
        if (SparkType.value.is !== "覺醒的輪迴星火") {
          let arr = [
            "51+3%主屬以上",
            "69+3%主屬以上",
            "57+3%主屬以上",
            "78+3%主屬以上",
            "42+3%主屬以上",
          ];
          if (arr.includes(AimType.value.is)) {
            return "點30000次";
          } else {
            return "點到有";
          }
        }
      });

      const DiceSparkOnceFn = () => {
        checkSparkList();
        if (checkAlert.value !== "") return alert("選單設定有誤 請確認");
        if (SparkSysBool.value) return console.log("執行中 點了無效");
        SparkSysBool.value = true;
        // 先清空字串內容 確保動畫流暢
        SparkResultRender.value = [];
        DiceSparkOnce();
        if (!hasSparkAnimate.value) {
          SparkSysBool.value = false;
          return;
        } else {
          SparkAnimateBool.value = true;
          setTimeout(() => {
            SparkAnimateBool.value = false;
          }, 200);
          setTimeout(() => {
            SparkSysBool.value = false;
          }, 400);
        }
      };
      const DiceSparkToSuccess = () => {
        checkSparkList();
        if (checkAlert.value !== "") return alert("選單設定有誤 請確認");
        if (SparkSysBool.value) return console.log("執行中 點了無效");
        SparkSysBool.value = true;
        const MaxTry = 30000;
        let i = 0;
        setTimeout(() => {
          while (i < MaxTry) {
            i++;
            DiceSparkOnce();
            // console.log(i);
            if (SparkAimBool.value) {
              console.log("測試目標");
              SparkSysBool.value = false;
              return;
            }
            if (i === MaxTry) {
              console.log("太難洗了");
              console.log("要加的次數", i);
              console.log("總計次數", SparkCount.value);
              SparkSysBool.value = false;
              return;
            }
          }
        }, 100);
      };
      const ChangeAimBool = computed(() => {
        if (!SparkAimBool.value && SparkCount.value !== 0) return true;
        return false;
      });
      const ResetSparkSys = () => {
        SparkAimBool.value = false;
        SparkCount.value = 0;
        SparkResultRender.value = [];
        window.scrollTo({ top: 0 });
      };
      const SparkResultRender = ref([]);
      const SparkPlusRule = reactive({ data: [] });
      const IsTwoSubStats = ref(false);
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
          if (item.Attr === "INTLUK") {
            attrdata[2].val += item.Lv * twoAttr;
            attrdata[3].val += item.Lv * twoAttr;
          }
          if (item.Attr === "穿戴等級減少") attrdata[4].val += item.Lv * 5;
          if (item.Attr === "最大HP") attrdata[5].val += item.Lv * pp;
          if (item.Attr === "最大MP") attrdata[6].val += item.Lv * pp;
          if (item.Attr === "防禦力") attrdata[7].val += item.Lv * defence;
          if (item.Attr === "攻擊力" && EquipType.value.is !== "創世")
            attrdata[12].val += item.Lv * 1;
          if (item.Attr === "魔力" && EquipType.value.is !== "創世")
            attrdata[13].val += item.Lv * 1;
          if (item.Attr === "攻擊力" && EquipType.value.is === "創世") {
            handWeaponType();
            attrdata[12].val = weaponType.value.is.atk[item.Lv - 1];
          }
          if (item.Attr === "魔力" && EquipType.value.is === "創世") {
            handWeaponType();
            attrdata[13].val = weaponType.value.is.atk[item.Lv - 1];
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
            if (
              item.title === "全屬性" ||
              item.title === "總傷害" ||
              item.title === "BOSS攻擊傷害"
            ) {
              msgVal = `+${item.val}%`;
            }
            if (item.title === "套用等級減少") {
              msgVal = `-${item.val}`;
            }
            SparkResultRender.value.push({ title: msgTitle, val: msgVal });
          }
        });
        let aim = { key: "", val: 0 };
        aim.key = SparkGoal.value.key;
        if (aim.key === "atk") {
          let AtkVal = 0;
          let MainVal = 0;
          let AllVal = attrdata[14].val;
          let BossVal = attrdata[10].val + attrdata[11].val;
          if (JobType.value.is === "劍士" || JobType.value.is === "海盜力") {
            MainVal += attrdata[0].val;
            MainVal += attrdata[1].val * SUBtoMAINSTAT.value;
          }
          if (JobType.value.is === "弓箭手" || JobType.value.is === "海盜敏") {
            MainVal += attrdata[1].val;
            MainVal += attrdata[0].val * SUBtoMAINSTAT.value;
          }
          if (JobType.value.is === "法師") {
            MainVal += attrdata[2].val;
            MainVal += attrdata[3].val * SUBtoMAINSTAT.value;
          }
          if (JobType.value.is === "盜賊") {
            MainVal += attrdata[3].val;
            MainVal += attrdata[1].val * SUBtoMAINSTAT.value;
            if (IsTwoSubStats.value) {
              MainVal += attrdata[0].val * SUBtoMAINSTAT.value;
            }
          }
          if (JobType.value.is === "法師") {
            AtkVal += attrdata[13].val;
          } else {
            AtkVal += attrdata[12].val;
          }
          AtkVal += MainVal * MAINSTATtoATK.value;
          AtkVal += BossVal * BOSStoATK.value;
          AtkVal += AllVal * AllSTATtoATK.value;
          aim.val = AtkVal;
          // console.log("這次的計算攻擊量:", aim.val);
        } else if (aim.key === "hp") {
          aim.val = attrdata[5].val;
        } else {
          let MainVal = 0;
          let AllVal = attrdata[14].val;
          let AtkVal = attrdata[12].val;
          if (JobType.value.is === "劍士" || JobType.value.is === "海盜力") {
            MainVal += attrdata[0].val;
            MainVal += attrdata[1].val * SUBtoMAINSTAT.value;
          }
          if (JobType.value.is === "弓箭手" || JobType.value.is === "海盜敏") {
            MainVal += attrdata[1].val;
            MainVal += attrdata[0].val * SUBtoMAINSTAT.value;
          }
          if (JobType.value.is === "法師") {
            MainVal += attrdata[2].val;
            MainVal += attrdata[3].val * SUBtoMAINSTAT.value;
          }
          if (JobType.value.is === "盜賊") {
            MainVal += attrdata[3].val;
            MainVal += attrdata[1].val * SUBtoMAINSTAT.value;
            if (IsTwoSubStats.value) {
              MainVal += attrdata[0].val * SUBtoMAINSTAT.value;
            }
          }
          MainVal += AllVal * AllSTATtoMAINSTAT.value;
          MainVal += AtkVal * ATKtoMAINSTAT.value;
          aim.val = MainVal;
          // console.log("這次的計算主屬量:", aim.val);
        }

        if (aim.val >= SparkGoal.value.is) {
          console.log("顯示結果", SparkResultRender.value);
          console.log("目標達成");
          SparkAimBool.value = true;
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
        IsTwoSubStats,
        // 目標提示詞
        WeaponTypeHint,
        HPTypeHint,
        // 裝備圖
        UseImgItem,
        EquipImgRender,
        handImgItem,
        // 等值換算
        AllSTATtoATK,
        MAINSTATtoATK,
        BOSStoATK,
        AllSTATtoMAINSTAT,
        SUBtoMAINSTAT,
        ATKtoMAINSTAT,
        // 星火運算
        UseSparkFrame,
        DiceSparkOnceFn,
        DiceSparkToSuccess,
        SparkSuccessBtn,
        SparkResultRender,
        SparkSysBool,
        hasSparkAnimate,
        SparkAnimateBool,
        SparkCount,
        SparkCountRender,
        SparkAimBool,
        checkAlert,
        ResetSparkSys,
        ChangeAimBool,
      };
    },
  };
  createApp(App).mount("#app");
};
