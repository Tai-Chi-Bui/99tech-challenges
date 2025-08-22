/**
 * Problem 4: sum to n
 */

/**
 * Method 1: loop
 * Time: O(n), Space: O(1)
 */
function my_loop(n: number): number {
    if (n <= 0) return 0;
    
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}

/**
 * Method 2: Math
 * Time: O(1), Space: O(1)
 */
function my_math(n: number): number {
    if (n <= 0) return 0;
    return (n * (n + 1)) / 2;
}

/**
 * Method 3: recursion
 * Time: O(n), Space: O(n)
 */
function my_recursion(n: number): number {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    return n + my_recursion(n - 1);
}



// test
console.log('my_loop(10):', my_loop(10));
console.log('my_math(10):', my_math(10));
console.log('my_recursion(10):', my_recursion(10));  


console.log('my_loop(0):', my_loop(0));
console.log('my_math(0):', my_math(0));
console.log('my_recursion(0):', my_recursion(0));  





