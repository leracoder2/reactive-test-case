import "./index.scss";

function findParent<T extends HTMLElement>(element: HTMLElement, predicate: (el: T) => boolean): T | null {
	let current: HTMLElement | null = element;
	while (current && !predicate(current as T)) {
	  current = current.parentElement;
	}
	return current as T | null;
}

const getNextSibling = (element: HTMLElement): HTMLElement | null => {
  return element.nextElementSibling as HTMLElement;
};

function maskPhoneFields() : void {
	const phoneFields = document.querySelectorAll<HTMLInputElement | null>('[type="phone"]');

	if (!phoneFields) {
		return;
	}

	phoneFields.forEach((input) => {
		input.addEventListener("input", phoneMask);
		input.addEventListener("focus", phoneMask);
		input.addEventListener("blur", phoneMask);
		
		function phoneMask(event: { type: string; }) {
			const blank = '+7 (___) ___-__-__';   
			const val = this.value.replace(/\D/g, '').replace(/^[0-9]/, '7');
			
			let i = 0;
			this.value = blank.replace(/./g, function(char) {
				if (/[_\d]/.test(char) && i < val.length) return val.charAt(i++);
				return i >= val.length ? "" : char;
			});
		};
	});
}

function maskNumberFields(nameField:string, pattern: string) : void {
	const input = document.querySelector<HTMLInputElement | null>(nameField);

	if (!input) {
		return;
	}

	input.addEventListener("input", numberMask);
	input.addEventListener("focus", numberMask);
	input.addEventListener("blur", numberMask);

	function numberMask(event: { type: string; }) {
		const blank = pattern;   
		const val = this.value.replace(/\D/g, '');
		
		let i = 0;
		this.value = blank.replace(/./g, function(char) {
			if (/[_\d]/.test(char) && i < val.length) return val.charAt(i++);
			return i >= val.length ? "" : char;
		});
	};
}

document.addEventListener("DOMContentLoaded", function() {
	maskPhoneFields();
	
	maskNumberFields('#passport-series', '____');
	maskNumberFields('#passport-number', '______');
	maskNumberFields('#passport-issue-day', '__');
	maskNumberFields('#passport-issue-month', '__');
	maskNumberFields('#passport-issue-year', '____');
});

document.addEventListener('DOMContentLoaded', () => {
	let errorList : HTMLElement[] = [];
	const form = document.querySelector<HTMLFormElement | null>('.form');
	
	if (!form) {
		return;
	}

	const formSteps = form?.querySelectorAll<HTMLFieldSetElement | null>('.form__step');

	if (!formSteps) {
		return;
	}

	if (formSteps.length > 1) {
		formSteps.forEach((step) => {
			step.classList.add('form__step--disabled');
		});
		formSteps[0].classList.remove('form__step--disabled');
	}

	const formStepButtons = form?.querySelectorAll<HTMLButtonElement | null>('.form__step-next');

	if (!formStepButtons) {
		return;
	}

	formStepButtons.forEach((button) => {
		button?.addEventListener('click', (e) => {
			const element = e.target as HTMLElement;
			const formStep = findParent<HTMLFieldSetElement | null>(element, (el) => el.classList.contains('form__step'));
			
			if (!formStep) {
				return;
			}
			
			// проверка полей на заполненность при переходе к следующему шагу
			const formStepFields = formStep.querySelectorAll<HTMLInputElement>('.form__field');
			
			formStepFields.forEach((field) => {
				if (field.hasAttribute('required') && field.value.length === 0) {
					field.classList.add('form__field--empty');
					errorList.push(field);
				} else {
					field.classList.remove('form__field--empty');
				}
			});

			if (errorList.length > 0) {
				// вывод сообщения об ошибке
				const errorText = formStep.querySelector<HTMLElement>('.form__error-caption');

				if (!errorText) {
					button.insertAdjacentHTML('beforebegin', '<span class="form__error-caption">Ошибка: не все поля заполнены</span>');
				}

				errorList = [];
			} else {
				// переход к следующему шагу
				formStep.classList.add('form__step--filled');
				const nextFormStep = formStep.nextElementSibling as HTMLElement;
				nextFormStep.classList.remove('form__step--disabled');
				nextFormStep.classList.remove('form__step--filled');
			}
		});
	});

	// отправка формы - отображение результата
	const formSubmit = form?.querySelector<HTMLInputElement | null>('.form__submit');

	if (!formSubmit) {
		return;
	}

	formSubmit?.addEventListener('click', (e) => {
		e.preventDefault();
		const formResult = document.querySelector<HTMLElement | null>('.form-result');
		
		if (!formResult) {
			return;
		}

		form.classList.add('form--disabled');
		formResult.classList.remove('form-result--disabled');
	});
});



export {};
  