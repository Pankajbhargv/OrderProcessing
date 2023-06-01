function validation(){
    if(document.Formfill.Username.value==""){
        document.getElementById("result").innerHTML="Enter Username*";
        return false;
    }
    else if(document.Formfill.Username.length<6){
        document.getElementById("result").innerHTML="Enter atleast 6 characters*";
        return false;
    }

    else if(document.Formfill.email.value==""){
        document.getElementById("result").innerHTML="Enter Email Address";
        return false;
    }

    else if(document.Formfill.password.value==""){
        document.getElementById("result").innerHTML="Enter Password";
        return false;
    }

    else if(document.Formfill.password.length<6){
        document.getElementById("result").innerHTML="Enter atleast 6 characters";
        return false;
    }

    else if(document.Formfill.cPassword.value==""){
        document.getElementById("result").innerHTML="Enter Confirm Password";
        return false;
    }

    else if(document.Formfill.cPassword.value!==document.Formfill.password.value){
        document.getElementById("result").innerHTML="Password doesn't match";
        return false;
    }

    else if(document.Formfill.cPassword.value==document.Formfill.password.value){
        popup.classList.add("open-slide")
        return false;
    }


}


var popup = document.getElementById('popup');

function closeSlide(){
    popup.classList.remove("open-slide");
}