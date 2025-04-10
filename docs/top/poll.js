const options = [
  {id:"option1",text: "JavaScript", votes:0}, (id:"option2", text:"Python", votes:0}, (id: "option3", text: "Java", votes:0},
(id:"option4", text:"(++", votes:0},
v function submitVote
く
const selectedOption = document-querySelector ('input [name="poll"]: checked*);
// console. log(selectedOption.value);
if(IselectedOption)(
alert("Please select an optin.");
return;
く
｝
const optionid = selectedOption.value;
const selectedOptionobj = options. find (option)=> option.id === optionid);
// console. log(selectedOptionObj):
if(selectedOptionobj)
selectedOption0bj.votes++;
console. log(selectedOptionobj);
displayResult);
v function displayResult
const result = document.getElementById("result' )B
result. innerHTML = ™$
✓
options. forEach ((option)=>
const percentage = ((option.votes/ getTotalVotes() * 100).toFixed(2) || 0;
const barwidth = percentage › 0 ? percentage + "*" : "0%";
const optionResult = document.createElement ("div");
optionResult.className = "option-result";
optionResult.innerHTML =
‹span class = "option-text">${option.text}</span>
‹div class = "bar-container">
‹div class = "bar" style="width: {barWidth);"*/div>
</div>
‹span class = "percentage">${percentage}%</span>
result.appendChild(optionResult);
3)8
v function getTotalVotesE
return options reduce(total,option)=> total + option.votes,0);
}
displayResultO; function refreshPage) €
location.reload();
｝
