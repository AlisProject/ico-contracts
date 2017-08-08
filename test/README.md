# Tests
The tests of ALIS contracts.

# memo
- The order of tests is important now. Because of testrpc specification.
    - That's why the some tests needs prefix like `01_`.
    - The point is time management.
        - I can not set time to previous.
        - Currently, They has only `evm_increaseTime` method.
    - Maybe it will improve in the future.
        - Like this PR: https://github.com/ethereumjs/testrpc/pull/305  
