//we need to sanitize and array-itize this input string!
/*e.g. '2*4-6' would become: [2,'*',4,'-',6]
'(4*-2)^4' would become: [[4,'*',-2],'^',4]
*/
Acc = {
	rand: function() {
		if(arguments.length===0) {
			return Math.random();
		} else if(arguments.length==1) {
			return Math.floor(Math.random() * arguments[0]);
		} else if(arguments.length >=2) {
			if(arguments[0] > arguments[1]) {
				var t = arguments[0];
				arguments[0] = arguments[1];
				arguments[1] = t;
			}
			arguments[1]++;
			return Math.floor(Math.random() * (arguments[1] - arguments[0])) + arguments[0];

		}

	},
	interpretArithmeticString: function( input ) {
		var temp = [];
		var curInput = '';
		var previous = null;
		for( var i = 0; i < input.length; i++ ) {
			switch(input[i]) {
				case '-':
					if( previous != null && '0123456789'.indexOf(previous) > -1 ) {
						temp.push('-');
					} else {
						curInput += input[i];
					}
					break;
				case '!': temp.push('!'); break;
				case '+': temp.push('+'); break;
				case '*': temp.push('*'); break;
				case '/': temp.push('/'); break;
				case '%': temp.push('%'); break;
				case '^': temp.push('^'); break;
				case 'd': temp.push('d'); break;
				case '(': //find corresponding closing parentheses, recursively process and append.
						var startParen = i;
						var endParen = -1;
						var depth = 1;
						for( var j = i+1; j < input.length; j++ ) {
							if( input[j] == ')') {
								depth--;
							} else if (input[j] == '('){
								depth++;
							}
							if( depth == 0 ) {
								endParen = j;
								j = input.length;
							}
						}
						if( endParen < 0 ) {
							console.warn('poorly formed input!', input );
							return [0];
						}

						var substring = input.substr(i,endParen+1-i);
						temp.push(this.interpretArithmeticString(substring.substr(1,substring.length-2)));
						i = endParen;
					break;
				case ')': break;//we'll never hit this one!
				default:
					if( '0123456789\.'.indexOf(input[i]) > -1 ) {
						curInput += input[i];
					}
					if( input.length == i+1 || '-+*/%^d()!'.indexOf(input[i+1]) > -1 ) {
						temp.push(curInput);
						curInput = '';
					}
					break;
			}
			previous = input[i];
		}

		return temp;
	},
	factorialCache: {},
	parseEquation: function( input, mode ) {
		if ( mode == undefined ) {
			mode = 'normal';
		}
		if( typeof input == 'string' ) {
			input = this.interpretArithmeticString( input );
		}

		/*we now just have an array... here are the rules:
		1. only run arithmetic on an array when none of it's elements are an array themselves
		2. order of operations is: parentheses, exponent, multiply & divide & mod, roll dice,  add & subtract
		*/

		for( var i = 0; i < input.length; i++ ) {
			if( Array.isArray(input[i])) { //if we have an array, replace it with the parsed results of the array.
				input[i] = this.parseEquation( input[i], mode );
			} else if( !isNaN(parseFloat(input[i]))) {
				input[i] = parseFloat(input[i]);
			}
		}
		//the resulting array is flat and ready to be interpreted.
		while( input.length > 1 ) {
			var highestWeight = 0;
			var highestIndex = -1;
			for( var i = 0; i < input.length; i++ ) {
				if( typeof input[i] == 'string') {
					var curWeight = 0;
					switch( input[i] ) {
						case '+': curWeight = 1; break;
						case '-': curWeight = 1; break;
						case 'd': curWeight = 2; break;
						case '/': curWeight = 3; break;
						case '*': curWeight = 3; break;
						case '%': curWeight = 3; break;
						case '^': curWeight = 4; break;
						case '!': curWeight = 5; break;
						default: console.warn( 'unweighted operator', input[i] ); break;
					}
					if( curWeight > highestWeight ) {
						highestWeight = curWeight;
						highestIndex = i;
					}
				}
			}
			// functions take 1 input!
			var isFunction = ('!'.indexOf(input[highestIndex]) > -1);
			if( highestIndex < 1 || ( highestIndex > input.length - 2 && !isFunction )) {
				console.warn('likely bad input... failing gracefully', JSON.stringify(input));
				return input[0]; //probably bad input... fail gracefully.
			}

			// --- switch highestIndex to the first element we will need
			highestIndex--;
			var outsect = input.splice( highestIndex, isFunction ? 2 : 3 );
			var a = outsect[0];
			var b = outsect[2];
			var operation = outsect[1];
			var result = 0;
			switch( operation ) {
				case '!':
					if( this.factorialCache[a] != undefined ) {
						result = this.factorialCache[a];
						break;
					}
					result = a;
					for( var i = a-1; i > 1; i-- ) {
						result *= i;
					}
					this.factorialCache[a] = result;
					break;
				case '+': result = a + b; break;
				case '-': result = a - b; break;
				case '/': result = a / b; break;
				case '%': result = a % b; break;
				case '*': result = a * b; break;
				case '^': result = Math.pow(a,b); break;
				case 'd':
					var dice = a;
					var sides = b;
					for(var i = 0; i < dice;i++){
						switch(mode){
							case 'normal': result+=(Acc.rand(1,sides)); break;
							case 'max':    result+= sides;              break;
							case 'min':    result+= 1;                  break;
						}
					}
				break;
			}
			// --- put the result back into the array to be processed.
			input.splice( highestIndex, 0, result );
		}
		return input[0];
	}
}