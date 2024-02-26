
window.onload = () =>{

    const {createApp, ref, reactive, computed, watch, onMounted , onUpdated} = Vue
    const App = {

        setup(){
            const test = ref(5207)
            return{
                test
            }   
        },

    }
    createApp(App).mount("#app")     

}


