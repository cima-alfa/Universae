// Separamos la funcionalidad de la calculadora del Global Scope metiendo el código entre corchetes.

{
	const operators = {
		multiply: '\u00D7',
		divide: '\u00F7',
		add: '+',
		substract: '-',
		parenthesisStart: '(',
		parenthesisEnd: ')',
		decimalPoint: ','
	};
	const operatorsRegex = Object.values(operators).map((value) => { return `\\${value}`; }).join();
	const allowedStartingOperators = [
		operators.substract,
		operators.parenthesisStart
	];
	const negativeParenthesisAfter = [
		operators.multiply,
		operators.divide,
		operators.add,
		operators.substract
	];
	
	const calcDisplay = document.querySelector('.calculator--display');
	const calcSubmit = document.querySelector('.calculator--button[type="submit"]');
	const calcClearAll = document.querySelector('.calculator--button[data-calc-clear-all]');
	const calcClearLast = document.querySelector('.calculator--button[data-calc-clear-last]');
	const calcButtons = document.querySelector('.calculator--body');
	
	const numberFormatter = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 20 });
	const equationFormat = (equation) => {
		return equation.replaceAll(/([0-9]+(?:\.[0-9]+)*(?:,[0-9]+)?)/g, (value) => { // Epresión regular busca números enteros y decimales que aparecen en la pantalla
			return numberFormatter.format(value.replaceAll('.', '').replaceAll(',', '.'));
		});
	};

	const historyButton = document.querySelector('input[data-calc-history]');
	const history = document.querySelector('.history ul');

	let resetCalc = false;

	// Añadir números y operadores a ecuación
	calcButtons.addEventListener('click', (event) => {
		const button = event.target.closest('.calculator--button[type="button"]');

		if (!button) {
			return;
		}
		
		const currentEquation = calcDisplay.textContent;
		let value = button.value;
		
		if (button.dataset.calcOperator !== undefined) {
			// Si el primer carácter introducido es uno de los operadors inlcuido en la lista `allowedStartindOperators`, reemplazamos la cadena inicial con el operador
			// En el resto de los casos no hacemos nada, ya que una ecuación no debe empezar, por ejemplo, con el operador de multiplicación
			if (currentEquation === '0' && allowedStartingOperators.includes(value)) {
				calcDisplay.textContent = value;

				return;
			} else if (currentEquation === '0') {
				return;
			}

			// Limitamos la cantidad máxima de paréntesis cerrados según el número de paréntesis abiertos ya en la ecuación
			if (value === operators.parenthesisEnd) {
				const startParenthesisCount = currentEquation.match(/\(/g)?.length;
				const endParenthesisCount = currentEquation.match(/\)/g)?.length;

				if (startParenthesisCount === endParenthesisCount) {
					return;
				}
			}

			resetCalc = false;

			// No permitimos múltiples operadores en seguida, excepto el operador de resta y los paréntesis
			// Si añadimos el paréntesis abierto, nos saltamos las condiciones
			// Le añadimos un paréntesis abierto al operador de resta en el caso de que el operador anterior está en la lista `negativeParenthesisAfter`
			// El paréntesis cerrado sólo se puede usar después de números y otros paréntesis cerrados
			// En el resto de los casos, reemplazamos el operador anterior con el nuevo, excepto el paréntesis abierto
			let matchedOperator;

			if (matchedOperator = currentEquation.match(new RegExp(`[${operatorsRegex}]$`))) {
				switch (value) {
					case operators.parenthesisStart:
						break;
					case operators.parenthesisEnd:
						if (matchedOperator[0] !== operators.parenthesisEnd) { 
							return; 
						}

						break;
					case operators.substract:
						value = negativeParenthesisAfter.includes(matchedOperator[0]) ? `${operators.parenthesisStart}${value}` : value;

						break;
					default:
						if (currentEquation.match(/\(-?$/)) {
							return;
						}

						matchedOperator[0] !== operators.parenthesisEnd ? clearLast() : null;

						break;
				}
			}

			// Si el primer carácter de la ecuación es el operador de resta y intentamos introducir otro operador, volvemos a enseñar el valor inicial en la pantalla (función `clearLast()`) y no hacemos nada más
			if (calcDisplay.textContent === '0') {
				return;
			}

			// Si abrimos un paréntesis sin un operador previo, añadimos el signo de multiplicación
			if (value === operators.parenthesisStart && currentEquation.match(/(?:[0-9]|\))$/)) {
				value = `${operators.multiply}${value}`;
			}

			calcDisplay.textContent += value;

			// Convertimos los números en la pantalla a un formato legible (Por ejemplo: 10.000,50)
			calcDisplay.textContent = equationFormat(calcDisplay.textContent);

			return;
		}
		
		// Sólo permitimos la coma decimal después de números enteros
		if (currentEquation.match(/(([0-9]+(?:\.[0-9]+)*(?:,[0-9]+){1})|[^0-9])(?!\1)$/) && value === operators.decimalPoint) {
			return;
		}

		// Si introducimos el primer carácter o el primer carácter después de un resultado es numérico, vaciamos la cadena inicial antes de introducir el carácter
		if ((currentEquation === '0' || resetCalc) && value !== ',') {
			calcDisplay.textContent = '';
		}

		resetCalc = false;

		// Si la ecuación termina con un paréntesis cerrado y añadimos otro número, añadimos el signo de multiplicación
		if (value.match(/[0-9]|\(/) && currentEquation.match(/\)$/)) {
			value = `${operators.multiply}${value}`;
		}
		
		calcDisplay.textContent += value;

		// Convertimos los números en la pantalla a un formato legible (Por ejemplo: 10.000,50)
		if (!calcDisplay.textContent.match(/,[0-9]+$/)) {
			calcDisplay.textContent = equationFormat(calcDisplay.textContent);
		}
	});

	// Evaluar ecuación
	calcSubmit.addEventListener('click', () => {
		const currentEquation = calcDisplay.textContent;
		let parseEquation = calcDisplay.textContent;

		parseEquation = parseEquation
			.replaceAll(operators.multiply, '*') // Reemplazamos el signo de multiplicar por un asterisco para poder evaluar la ecuación
			.replaceAll(operators.divide, '/') // Reemplazamos el signo de dividir por una barra para poder evaluar la ecuación
			.replaceAll('.', '') // Reemplazamos los separadores de miles con una cadena vacía
			.replaceAll(',', '.'); // Reemplazamos la coma decima con un punto para finalmente obtener un número float

		if (!isNaN(parseFloat(parseEquation)) && isFinite(parseEquation)) {
			return;
		}

		// Evaluamos la ecuación y devolvemos el resultado en formato legible (Por ejemplo: 10.000,50)
		// Usamos Function() en vez de eval(), ya que ofrece rendimiento y seguridad superior. (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#using_the_function_constructor)
		let value;
		let invalidEquation = false;

		try {
			value = Function(`
				"use strict";
				return (new Intl.NumberFormat('es-ES', { maximumFractionDigits: 20 })).format(${parseEquation})
			`)();

			calcDisplay.textContent = value;
		} catch (error) {
			invalidEquation = true;
			value = 'La ecuación no es válida!';
		}
		
		// Añadimos el resultado a la historia de la calculadora
		const li = document.createElement('li');
		const liButton = document.createElement('button');

		liButton.dataset.equationValid = !invalidEquation;
		liButton.dataset.equation = currentEquation;
		liButton.classList.add('history--recover');
		liButton.textContent += invalidEquation ? `${value} - " ${currentEquation} "` : `${currentEquation} = ${value}`;
		li.append(liButton);

		history.prepend(li);

		resetCalc = true;
	});
	
	// Resetear la calculadora
	calcClearAll.addEventListener('click', () => {
		calcDisplay.textContent = '0';
	});

	// Eliminar el último carácter en la pantalla
	calcClearLast.addEventListener('click', () => {
		clearLast();
	});

	function clearLast() {
		const currentEquation = calcDisplay.textContent;

		if (currentEquation === '0') {
			return;
		}

		calcDisplay.textContent = (result = calcDisplay.textContent.slice(0, -1)) === '' ? '0' : equationFormat(result);
	}

	history.addEventListener('click', (event) => {
		const target = event.target.closest('.history--recover');

		if (!target) {
			return;
		}

		calcDisplay.textContent = target.dataset.equation.trim();
		historyButton.checked = false;
	});
}

// Simulamos la funcionalidad de los botones para elementos con `role="button"`
document.addEventListener('keydown', (event) => {
	const target = event.target;

	if (target.matches('[role="button"]') && (event.key === 'Enter' || event.key === ' ')) {
		target.closest('[role="button"]').click();
	}
});