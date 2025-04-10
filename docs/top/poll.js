let poll =
{
    question: "Which is your favorite programming language?",
    answers:["Python", "Java", "R", "Php"],
    pollcount:100,
    answerweight:[60,10,20,10], //sum = 100
    selectanswer:-1
};

let polldom =
{
    question:document.querySelector(".poll .question"),
    answers:document.querySelector(".poll .answers")
};

polldom.question.innerText = poll.question;
polldom.answers.innerHTML  = poll.answers.map(function(answer,i){
    return(
        `
        <div class="answer" onclick="markanswer('${i}')">
        ${answer}
        <span class="percentage_bar"></span>
        <span class="percentage_value"></span>
        </div>
        
        `
    );
}).join("");


function markanswer(i)
{
    poll.selectanswer = +i;

    try{
        document.querySelector(".poll .answers .answer.selected")
        .classList.remove(".selected");
    }
    catch(msg){}

    document.querySelectorAll(".poll .answers .answer")
    [+i].classList.add(".selected");


    showresults();
}



function showresults()
{
    let answers = document.querySelectorAll(".poll .answers .answer");

    for (let i = 0; i < answers.length; i++) {
        
        let percentage = 0;

        if (i==poll.selectanswer) 
        {
            percentage = Math.round
            (
                (poll.answerweight[i] + 1) * 100 / (poll.pollcount + 1)
            );
        }

        else
        {
            percentage = Math.round
            (
                (poll.answerweight[i]) * 100 / (poll.pollcount + 1)
            );
        }

        answers[i].querySelector(".percentage_bar").style.width = percentage + "%";
        answers[i].querySelector(".percentage_value").innerText = percentage + "%";
        
    }
}
