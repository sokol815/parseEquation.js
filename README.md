# mathParser.js
A general math parser for javascript

supports: parentheses / exponents / division, multiplication, modulus / dice rolls / addition, subtraction.

PEMDAS order is followed... modulus is weighted the same as division and multiplication, dice rolls are between division/multiplication/modulus and addition/subtraction.
 

usage:

```
    <script type='text/javascript' src='parseEquation.min.js' ></script>
    <script>
      var equation = '1+2';
      console.log(Acc.parseEquation(equation)); //3
      console.log(Acc.parseEquation('1d6')); //1-6 randomly chosen
      console.log(Acc.parseEquation('1d6','max')); //6
      console.log(Acc.parseEquation('1d6','min')); //1
      console.log(Acc.parseEquation('2^13+2^-3')); //8192.125
      console.log(Acc.parseEquation('1--1')); //2
    </script>
```
