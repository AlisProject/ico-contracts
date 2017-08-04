#!/usr/bin/env bash

# Copyright (c) 2016 Smart Contract Solutions, Inc.
# Released under the MIT license
# https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/LICENSE

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  # Kill the testrpc instance that we started (if we started one and if it's still running).
  if [ -n "$testrpc_pid" ] && ps -p $testrpc_pid > /dev/null; then
    kill -9 $testrpc_pid
  fi
}

testrpc_running() {
  nc -z localhost 8545
}

if testrpc_running; then
  echo "Using existing testrpc instance"
else
  echo "Starting our own testrpc instance"
  # We define 10 accounts with balance 10,000M tokens, needed for high-value tests.
  testrpc \
    --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501200,10000000000000000000000000000"  \
    --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501201,10000000000000000000000000000"  \
    --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501202,10000000000000000000000000000"  \
    --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501203,10000000000000000000000000000"  \
    --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501204,10000000000000000000000000000"  \
    --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501205,10000000000000000000000000000"  \
    --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501206,10000000000000000000000000000"  \
    --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501207,10000000000000000000000000000"  \
    --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501208,10000000000000000000000000000"  \
    --account="0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501209,10000000000000000000000000000"  \
  > /dev/null &
  testrpc_pid=$!
fi

node_modules/.bin/truffle test --network testrpc "$@"
