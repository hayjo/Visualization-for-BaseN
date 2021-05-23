const $calcBoard = document.querySelector('.calc-board');
const $quotient = document.querySelector('.quotient');
const $inputFormBody = document.querySelector('.js__user-input__form');
const $userInput = document.querySelector('.js__user-input__input-box');
const $selectBoxBody = document.querySelector('.js__base-number__select-box');
const $polynomialTableHead = document.querySelector('.js__mark-polynomial-thead__exponent');
const $polynomialTableBody = document.querySelector('.js__mark-polynomial-tbody__remainder');

let BASE_NUMBER = 2;

function delay(waitingTime) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, waitingTime);
  });
}

function separateRemainderElement({ remainder, withoutRemainder }) {
  const $prefix = document.createTextNode('(');
  const $postfix = document.createTextNode(') + ');
  $calcBoard.insertBefore($prefix, $quotient);
  $calcBoard.insertBefore($postfix, $quotient.nextSibling);
  // $postfix는 $quotient 뒤에 추가해야 해서 $quotient의 다음 노드 앞에 삽입하도록 했다.

  $quotient.textContent = String(withoutRemainder);
  const $remainder = document.createElement('span');
  $remainder.textContent = String(remainder);
  $remainder.classList.add('remainder');
  $calcBoard.insertBefore($remainder, $postfix.nextSibling);
  // $remainder도 $postfix 뒤에 추가해야 해서 마찬가지로 다음 노드 앞에 삽입
}

function replaceQuotientElementWithNewQuotient({ base, quotient }) {
  $quotient.textContent = String(quotient);
  const $multipliedByBase = document.createTextNode(`${base} * `);
  $calcBoard.insertBefore($multipliedByBase, $quotient);
}

function resetElements() {
  const temporaryParent = new DocumentFragment();
  temporaryParent.appendChild($quotient);
  $calcBoard.textContent = '';
  $calcBoard.appendChild(temporaryParent);

  $polynomialTableHead.textContent = '';
  $polynomialTableBody.textContent = '';
}

function getElementBox(number, classList) {
  const $elementBox = document.createElement('span');
  $elementBox.textContent = number;

  classList.forEach((className) => {
    $elementBox.classList.add(className);
  });

  return $elementBox;
}

function updatePolynomialTable(base, index, remainder) {
  const $multiplierCell = document.createElement('td');
  const $remainderCell = document.createElement('td');

  const $multiplier = document.createElement('span');
  const $base = getElementBox(base, ['number-box']);
  const $exponent = getElementBox(index, ['exponent-box']);
  const $remainder = getElementBox(remainder, ['number-box']);

  $multiplier.appendChild($base);
  $multiplier.appendChild($exponent);

  $multiplierCell.appendChild($multiplier);
  $remainderCell.appendChild($remainder);

  $polynomialTableHead.prepend($multiplierCell);
  $polynomialTableBody.prepend($remainderCell);
}

async function getNumberByBase(base, number) {
  resetElements();

  let remainder = 0;
  let quotient = number;
  let result = '';
  let index = 0;

  while (quotient > 0) {
    remainder = quotient % base;
    const withoutRemainder = quotient - remainder;
    quotient = withoutRemainder / base;
    result = String(remainder) + result;

    updatePolynomialTable(base, index, remainder.toString(base));
    separateRemainderElement({
      remainder: remainder.toString(base),
      withoutRemainder,
    });
    await delay(300);
    replaceQuotientElementWithNewQuotient({
      base,
      quotient,
    });
    await delay(700);
    index++;
  }

  return result;
}

function modifiedThrottle(func) {
  let isWaiting = false;

  return async (...args) => {
    if (isWaiting) {
      return;
    }

    isWaiting = true;
    await func(...args);
    isWaiting = false;
  };
}

const modifiedGetNumberByBase = modifiedThrottle(getNumberByBase);

async function handleUserInput(event) {
  event.preventDefault();
  const inputNumber = Number($userInput.value);

  if (Number.isSafeInteger(inputNumber) && inputNumber > 0) {
    modifiedGetNumberByBase(BASE_NUMBER, inputNumber);
  }
}

function handleBaseNumberSelecting({ target }) {
  const selectedBase = target.children[target.selectedIndex].value;
  BASE_NUMBER = Number(selectedBase);
}

async function init() {
  $selectBoxBody.addEventListener('change', handleBaseNumberSelecting);
  $inputFormBody.addEventListener('submit', handleUserInput);
}

init();
