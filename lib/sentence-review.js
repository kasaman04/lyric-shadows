'use strict';
function notebook(state){return state.sentenceReview||=( {version:1,items:{},checked:{}} );}
function rememberMistake(state,attempt,question){
  const book=notebook(state);
  if(attempt.result&&['almost','incorrect','no_answer'].includes(attempt.result.verdict)&&question){
    const at=attempt.submittedAt||Date.parse(attempt.completedAt||attempt.createdAt)||0;
    const old=book.items[question.id];
    if(!old)book.items[question.id]={id:question.id,sentences:[...question.sentences],answer:question.answer,japanese:question.japanese||'',explanation:question.explanation,type:question.type,firstWrongAt:at,lastWrongAt:at};
    else old.lastWrongAt=Math.max(old.lastWrongAt,at);
  }
  if(attempt.result)book.checked[attempt.id]=true;
  // The seven-day practice receipt ledger is the historical import index.
  const receipts=state.sentencePractice?.receipts||{};
  for(const id of Object.keys(book.checked))if(receipts[id]===undefined)delete book.checked[id];
  return Boolean(book.items[attempt.questionId]);
}
const reviewCount=state=>Object.keys(state.sentenceReview?.items||{}).length;
const reviewItems=state=>Object.values(state.sentenceReview?.items||{}).sort((a,b)=>b.lastWrongAt-a.lastWrongAt||a.id.localeCompare(b.id)).map(({id,sentences,lastWrongAt})=>({id,sentences,lastWrongAt}));
function questionForReview(state,id){const items=state.sentenceReview?.items||{};if(!Object.hasOwn(items,id))throw Object.assign(new Error('復習する問題が見つかりません。'),{status:404});return items[id];}
module.exports={rememberMistake,reviewCount,reviewItems,questionForReview};
