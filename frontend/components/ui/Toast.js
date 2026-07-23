export const Toast = {

    success(message){

        showToast(message,"success");

    },

    error(message){

        showToast(message,"error");

    },

    warning(message){

        showToast(message,"warning");

    },

    info(message){

        showToast(message,"info");

    }

};

function showToast(message,type){

    const toast=document.createElement("div");

    toast.className=`toast ${type}`;

    toast.innerHTML=`

        <span>${message}</span>

    `;

    document.body.appendChild(toast);

    setTimeout(()=>{

        toast.classList.add("show");

    },50);

    setTimeout(()=>{

        toast.classList.remove("show");

        setTimeout(()=>{

            toast.remove();

        },300);

    },3000);

}