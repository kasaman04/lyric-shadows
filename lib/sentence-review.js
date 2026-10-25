'use strict';
const {QUESTIONS}=require('./sentence-game-bank');
const questionsById=new Map(QUESTIONS.map(question=>[question.id,question]));
function withTranslations(item){
  const current=questionsById.get(item.id);
  const sameSentences=current&&item.sentences.length===current.sentences.length&&item.sentences.every((text,index)=>text===current.sentences[index]);
  // Existing notebooks keep their original English. Only backfill a translation
  // when the current bank still contains exactly the same English text.
  const sentenceJapanese=item.sentences.map((text,index)=>item.sentenceJapanese?.[index]||(sameSentences?current.sentenceJapanese[index]:''));
  const japanese=item.japanese||(current?.answer===item.answer?current.japanese:'');
  return {...item,sentenceJapanese,japanese};
}
function notebook(state){return state.sentenceReview||=( {version:1,items:{},checked:{}} );}
function rememberMistake(state,attempt,question){
  const book=notebook(state);
  if(attempt.result&&['almost','incorrect','no_answer'].includes(attempt.result.verdict)&&question){
    const at=attempt.submittedAt||Date.parse(attempt.completedAt||attempt.createdAt)||0;
    const old=book.items[question.id];
    if(!old)book.items[question.id]={id:question.id,sentences:[...question.sentences],sentenceJapanese:[...(question.sentenceJapanese||[])],answer:question.answer,japanese:question.japanese||'',explanation:question.explanation,type:question.type,firstWrongAt:at,lastWrongAt:at};
    else old.lastWrongAt=Math.max(old.lastWrongAt,at);
  }
  if(attempt.result)book.checked[attempt.id]=true;
  // The seven-day practice receipt ledger is the historical import index.
  const receipts=state.sentencePractice?.receipts||{};
  for(const id of Object.keys(book.checked))if(receipts[id]===undefined)delete book.checked[id];
  return Boolean(book.items[attempt.questionId]);
}
const reviewCount=state=>Object.keys(state.sentenceReview?.items||{}).length;
const reviewItems=state=>Object.values(state.sentenceReview?.items||{}).sort((a,b)=>b.lastWrongAt-a.lastWrongAt||a.id.localeCompare(b.id)).map(withTranslations).map(({id,sentences,sentenceJapanese,lastWrongAt})=>({id,sentences,sentenceJapanese,lastWrongAt}));
function questionForReview(state,id){const items=state.sentenceReview?.items||{};if(!Object.hasOwn(items,id))throw Object.assign(new Error('復習する問題が見つかりません。'),{status:404});return withTranslations(items[id]);}
module.exports={rememberMistake,reviewCount,reviewItems,questionForReview};
