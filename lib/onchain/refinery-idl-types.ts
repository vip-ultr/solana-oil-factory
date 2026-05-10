/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/refinery.json`.
 */
export type Refinery = {
  "address": "2tPLLPQeLLNL4UDBbeagSUAABJcB3fHGTJaLGEzrx3rE",
  "metadata": {
    "name": "refinery",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Sol Oil Factory — Token Refinery Anchor program"
  },
  "instructions": [
    {
      "name": "claim",
      "docs": [
        "Holder claims their pro-rata share against a specific",
        "snapshot. Verifies merkle proof, applies per-claim cap,",
        "transfers tokens from escrow PDA to holder ATA, creates a",
        "ClaimReceipt PDA for replay protection, pays the 0.001 SOL",
        "claim fee."
      ],
      "discriminator": [
        62,
        198,
        214,
        193,
        213,
        159,
        108,
        210
      ],
      "accounts": [
        {
          "name": "holder",
          "docs": [
            "The holder claiming. Pays the 0.001 SOL claim fee + the",
            "rent for the new ClaimReceipt PDA."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "holderAta",
          "writable": true
        },
        {
          "name": "treasuryConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "feeReceiverSol",
          "writable": true
        },
        {
          "name": "refinery",
          "docs": [
            "Mut because pool_remaining, pool_total_claimed, and",
            "holders_claimed are decremented / incremented."
          ],
          "writable": true
        },
        {
          "name": "snapshot",
          "docs": [
            "The snapshot the holder is claiming against. PDA seeds",
            "re-derive (refinery, snapshot_index); explicit constraints",
            "catch malformed clients."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  110,
                  97,
                  112,
                  115,
                  104,
                  111,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "refinery"
              },
              {
                "kind": "arg",
                "path": "args.snapshot_index"
              }
            ]
          }
        },
        {
          "name": "escrowAta",
          "writable": true
        },
        {
          "name": "escrowAuthority",
          "docs": [
            "PDA signer for the escrow ATA. We construct seeds in the",
            "handler to sign the transfer_checked CPI."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "refinery"
              }
            ]
          }
        },
        {
          "name": "claimReceipt",
          "docs": [
            "Replay protection. If a receipt already exists for this",
            "(refinery, holder, snapshot_index), this `init` fails and",
            "the whole tx reverts."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  97,
                  105,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "refinery"
              },
              {
                "kind": "account",
                "path": "holder"
              },
              {
                "kind": "arg",
                "path": "args.snapshot_index"
              }
            ]
          }
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "claimArgs"
            }
          }
        }
      ]
    },
    {
      "name": "closeRefinery",
      "docs": [
        "Operator closes the refinery permanently. Refunds the",
        "remaining pool to the operator and sets status = Closed.",
        "Closed is terminal; the operator must launch a new refinery",
        "to re-distribute the same token."
      ],
      "discriminator": [
        230,
        167,
        29,
        10,
        145,
        203,
        145,
        210
      ],
      "accounts": [
        {
          "name": "operator",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "operatorAta",
          "writable": true
        },
        {
          "name": "refinery",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  105,
                  110,
                  101,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              },
              {
                "kind": "account",
                "path": "operator"
              }
            ]
          }
        },
        {
          "name": "escrowAta",
          "writable": true
        },
        {
          "name": "escrowAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "refinery"
              }
            ]
          }
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": []
    },
    {
      "name": "deposit",
      "docs": [
        "Operator tops up an existing refinery's pool. Same 1%",
        "deposit fee semantics as launch. Allowed when status is",
        "Active or OperatorPaused; rejected when Closed."
      ],
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "operator",
          "docs": [
            "Operator-only. Verified against `refinery.operator` below",
            "(and implicitly via the refinery PDA seeds)."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "operatorAta",
          "writable": true
        },
        {
          "name": "treasuryConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "treasurySwapPda",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                  95,
                  115,
                  119,
                  97,
                  112
                ]
              }
            ]
          }
        },
        {
          "name": "treasurySwapAta",
          "docs": [
            "Pre-existing ATA created by `init_refinery` for this mint.",
            "Anchor verifies it's the correct ATA via the constraint;",
            "no init_if_needed (the first refinery for the mint already",
            "created it)."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "treasurySwapPda"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "refinery",
          "docs": [
            "PDA seeds re-derive (mint, operator); the explicit constraint",
            "is belt-and-suspenders for audit clarity. Status must be",
            "Active or OperatorPaused — deposits to a Closed refinery",
            "are rejected (use init_refinery to launch a new one instead)."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  105,
                  110,
                  101,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              },
              {
                "kind": "account",
                "path": "operator"
              }
            ]
          }
        },
        {
          "name": "escrowAta",
          "writable": true
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "depositArgs"
            }
          }
        }
      ]
    },
    {
      "name": "initRefinery",
      "docs": [
        "Operator launches a refinery for a given SPL or Token-2022",
        "mint. Atomic: pays 0.1 SOL launch fee, transfers the pool",
        "deposit to a program-owned escrow ATA, transfers the 1%",
        "deposit fee (in deposited token) to the platform treasury",
        "swap ATA, and initialises the Refinery account. Status",
        "transitions straight to Active."
      ],
      "discriminator": [
        31,
        55,
        94,
        109,
        119,
        73,
        150,
        214
      ],
      "accounts": [
        {
          "name": "operator",
          "docs": [
            "Operator launches & funds the refinery. Becomes",
            "`refinery.operator` permanently."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "operatorAta",
          "docs": [
            "Operator's source ATA. Funds the pool + the 1% deposit fee."
          ],
          "writable": true
        },
        {
          "name": "treasuryConfig",
          "docs": [
            "Platform config. Mut because we increment",
            "`refineries_launched_count`."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "feeReceiverSol",
          "docs": [
            "SOL fee destination — verified to equal the value set in",
            "treasury_config to prevent fee redirection."
          ],
          "writable": true
        },
        {
          "name": "treasurySwapPda",
          "docs": [
            "Treasury swap PDA — the authority that owns the ATAs holding",
            "1% deposit-fee tokens awaiting off-chain swap to SOL."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                  95,
                  115,
                  119,
                  97,
                  112
                ]
              }
            ]
          }
        },
        {
          "name": "treasurySwapAta",
          "docs": [
            "ATA holding 1% deposit-fee tokens for THIS mint. First",
            "refinery for this mint creates the ATA; subsequent reuse."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "treasurySwapPda"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "refinery",
          "docs": [
            "The new refinery account. PDA seeds disambiguate by",
            "(mint, operator) so multiple operators can launch refineries",
            "for the same mint."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  105,
                  110,
                  101,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              },
              {
                "kind": "account",
                "path": "operator"
              }
            ]
          }
        },
        {
          "name": "escrowAuthority",
          "docs": [
            "PDA owning the escrow ATA — pure signer authority, no data."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "refinery"
              }
            ]
          }
        },
        {
          "name": "escrowAta",
          "docs": [
            "Pool escrow ATA. Always new (refinery PDA is unique per",
            "(mint, operator) pair, so escrow_authority + escrow_ata are",
            "always fresh)."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "escrowAuthority"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "initRefineryArgs"
            }
          }
        }
      ]
    },
    {
      "name": "initTreasury",
      "docs": [
        "One-time platform initialization. Sets the snapshot authority,",
        "the Squads-derived pause authority, the SOL fee receiver, and",
        "the fee schedule. Gated on the program's BPF Loader",
        "Upgradeable upgrade authority — only the deployer can call."
      ],
      "discriminator": [
        105,
        152,
        173,
        51,
        158,
        151,
        49,
        14
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "The deployer / upgrade authority. Verified below against the",
            "program's `ProgramData` account — the only signer permitted",
            "to call `init_treasury`. After init, this becomes",
            "`treasury_config.admin` and can be rotated via `rotate_authority`."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "treasuryConfig",
          "docs": [
            "Singleton platform config. PDA collision on this seed is",
            "what makes `init_treasury` strictly one-shot."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "treasurySwapPda",
          "docs": [
            "PDA used only as the ATA owner for the 1% deposit-fee",
            "holdings (auto-swapped to SOL via off-chain Jupiter cron).",
            "Has no on-chain account data — derived only."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                  95,
                  115,
                  119,
                  97,
                  112
                ]
              }
            ]
          }
        },
        {
          "name": "programData",
          "docs": [
            "The program's `ProgramData` account from the BPF Loader",
            "Upgradeable. The upgrade authority recorded here must match",
            "`admin` — that's what front-run-protects this instruction."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  28,
                  5,
                  143,
                  130,
                  169,
                  153,
                  125,
                  167,
                  16,
                  130,
                  31,
                  77,
                  77,
                  41,
                  134,
                  182,
                  99,
                  88,
                  86,
                  6,
                  234,
                  119,
                  58,
                  0,
                  245,
                  64,
                  169,
                  85,
                  145,
                  173,
                  244,
                  119
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                2,
                168,
                246,
                145,
                78,
                136,
                161,
                176,
                226,
                16,
                21,
                62,
                247,
                99,
                174,
                43,
                0,
                194,
                185,
                61,
                22,
                193,
                36,
                210,
                192,
                83,
                122,
                16,
                4,
                128,
                0,
                0
              ]
            }
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "initTreasuryArgs"
            }
          }
        }
      ]
    },
    {
      "name": "submitSnapshot",
      "docs": [
        "Platform snapshot authority publishes the merkle root for",
        "a refinery's per-epoch eligible-holder set. Only the",
        "configured snapshot_authority key may sign. The off-chain",
        "indexer computes the tree from on-chain holder data after",
        "applying sybil filters."
      ],
      "discriminator": [
        38,
        160,
        21,
        51,
        100,
        75,
        87,
        198
      ],
      "accounts": [
        {
          "name": "snapshotAuthority",
          "docs": [
            "Must equal `treasury_config.snapshot_authority`. Pays for",
            "the new Snapshot account's rent."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "treasuryConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "refinery",
          "docs": [
            "Mut because we increment `current_snapshot_index`. Status",
            "must be Active — paused or closed refineries don't accept",
            "new snapshots."
          ],
          "writable": true
        },
        {
          "name": "snapshot",
          "docs": [
            "New snapshot PDA. The index in the seed is",
            "`refinery.current_snapshot_index + 1` — i.e. the next slot",
            "after the most recently submitted snapshot."
          ],
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "submitSnapshotArgs"
            }
          }
        }
      ]
    },
    {
      "name": "toggleOperatorPause",
      "docs": [
        "Operator-scope pause toggle. Flips between Active and",
        "OperatorPaused for one specific refinery."
      ],
      "discriminator": [
        123,
        96,
        89,
        136,
        194,
        234,
        162,
        80
      ],
      "accounts": [
        {
          "name": "operator",
          "signer": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "refinery",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  105,
                  110,
                  101,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              },
              {
                "kind": "account",
                "path": "operator"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "togglePlatformPause",
      "docs": [
        "Platform-wide emergency pause toggle. Squads-PDA gated.",
        "When paused, all init/deposit/snapshot/claim/withdraw",
        "instructions return PlatformPaused. close_refinery is",
        "intentionally permitted as an operator escape hatch."
      ],
      "discriminator": [
        141,
        248,
        62,
        85,
        233,
        50,
        144,
        96
      ],
      "accounts": [
        {
          "name": "pauseAuthority",
          "signer": true
        },
        {
          "name": "treasuryConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "updateRate",
      "docs": [
        "Operator advances the refinery to a new epoch with updated",
        "distribution params. Outstanding ClaimReceipts remain valid",
        "for replay protection; new claims need a new snapshot of",
        "the new epoch."
      ],
      "discriminator": [
        24,
        225,
        53,
        189,
        72,
        212,
        225,
        178
      ],
      "accounts": [
        {
          "name": "operator",
          "signer": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "refinery",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  105,
                  110,
                  101,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              },
              {
                "kind": "account",
                "path": "operator"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "updateRateArgs"
            }
          }
        }
      ]
    },
    {
      "name": "withdraw",
      "docs": [
        "Operator withdraws from the pool. Lock-gated: rejected if",
        "the claim window is open OR within 7 days after the window",
        "closes. Open-ended refineries cannot withdraw without first",
        "calling close_refinery."
      ],
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "operator",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "operatorAta",
          "writable": true
        },
        {
          "name": "treasuryConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "refinery",
          "docs": [
            "PDA seeds re-derive (mint, operator). Status must be Active",
            "or OperatorPaused. Closed refineries use close_refinery",
            "(which has different semantics — refunds entire balance)."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  105,
                  110,
                  101,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              },
              {
                "kind": "account",
                "path": "operator"
              }
            ]
          }
        },
        {
          "name": "escrowAta",
          "writable": true
        },
        {
          "name": "escrowAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "refinery"
              }
            ]
          }
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "withdrawArgs"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "claimReceipt",
      "discriminator": [
        223,
        233,
        11,
        229,
        124,
        165,
        207,
        28
      ]
    },
    {
      "name": "refinery",
      "discriminator": [
        254,
        181,
        80,
        146,
        232,
        250,
        1,
        110
      ]
    },
    {
      "name": "snapshot",
      "discriminator": [
        137,
        213,
        28,
        133,
        224,
        161,
        48,
        108
      ]
    },
    {
      "name": "treasuryConfig",
      "discriminator": [
        124,
        54,
        212,
        227,
        213,
        189,
        168,
        41
      ]
    }
  ],
  "events": [
    {
      "name": "authorityRotated",
      "discriminator": [
        89,
        124,
        120,
        223,
        3,
        19,
        185,
        230
      ]
    },
    {
      "name": "claimMade",
      "discriminator": [
        46,
        137,
        105,
        193,
        40,
        75,
        104,
        209
      ]
    },
    {
      "name": "epochAdvanced",
      "discriminator": [
        41,
        220,
        14,
        123,
        117,
        70,
        117,
        157
      ]
    },
    {
      "name": "operatorWithdraw",
      "discriminator": [
        21,
        16,
        165,
        159,
        143,
        30,
        50,
        35
      ]
    },
    {
      "name": "platformPauseToggled",
      "discriminator": [
        37,
        90,
        30,
        242,
        79,
        111,
        135,
        215
      ]
    },
    {
      "name": "refineryClosed",
      "discriminator": [
        171,
        189,
        104,
        18,
        44,
        230,
        8,
        120
      ]
    },
    {
      "name": "refineryDeposit",
      "discriminator": [
        103,
        188,
        74,
        47,
        235,
        21,
        172,
        243
      ]
    },
    {
      "name": "refineryLaunched",
      "discriminator": [
        201,
        114,
        241,
        114,
        21,
        179,
        56,
        248
      ]
    },
    {
      "name": "refineryPauseToggled",
      "discriminator": [
        186,
        130,
        58,
        231,
        232,
        80,
        44,
        137
      ]
    },
    {
      "name": "snapshotSubmitted",
      "discriminator": [
        254,
        45,
        92,
        130,
        12,
        79,
        160,
        23
      ]
    },
    {
      "name": "treasuryInitialized",
      "discriminator": [
        199,
        73,
        174,
        205,
        59,
        145,
        55,
        179
      ]
    },
    {
      "name": "verifiedCtoAssigned",
      "discriminator": [
        60,
        223,
        108,
        69,
        126,
        123,
        156,
        162
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "Caller is not authorized for this action"
    },
    {
      "code": 6001,
      "name": "platformPaused",
      "msg": "Platform is currently paused"
    },
    {
      "code": 6002,
      "name": "refineryNotActive",
      "msg": "Refinery is not active"
    },
    {
      "code": 6003,
      "name": "refineryClosed",
      "msg": "Refinery is closed"
    },
    {
      "code": 6004,
      "name": "refineryAlreadyClosed",
      "msg": "Refinery is already closed"
    },
    {
      "code": 6005,
      "name": "invalidStateForToggle",
      "msg": "Invalid state for this toggle"
    },
    {
      "code": 6006,
      "name": "poolMustBePositive",
      "msg": "Pool deposit must be greater than zero"
    },
    {
      "code": 6007,
      "name": "claimCapOutOfRange",
      "msg": "Per-claim cap out of range (must be 10–10000 bps)"
    },
    {
      "code": 6008,
      "name": "claimWindowTooShort",
      "msg": "Claim window too short (must be 0 or >= 60 seconds)"
    },
    {
      "code": 6009,
      "name": "claimRateMustBePositive",
      "msg": "Claim rate must be positive"
    },
    {
      "code": 6010,
      "name": "depositFeeTooHigh",
      "msg": "Deposit fee bps too high (max 1000 = 10%)"
    },
    {
      "code": 6011,
      "name": "insufficientOperatorBalance",
      "msg": "Operator balance insufficient for pool + deposit fee"
    },
    {
      "code": 6012,
      "name": "freezeAuthorityActiveNotAcknowledged",
      "msg": "Token's freeze authority is active and was not acknowledged"
    },
    {
      "code": 6013,
      "name": "depositMustBePositive",
      "msg": "Deposit amount must be positive"
    },
    {
      "code": 6014,
      "name": "withdrawAmountInvalid",
      "msg": "Withdrawal amount invalid"
    },
    {
      "code": 6015,
      "name": "withdrawalLocked",
      "msg": "Withdrawal locked: claim window open or 7-day cooldown active"
    },
    {
      "code": 6016,
      "name": "epochMismatch",
      "msg": "Snapshot epoch does not match refinery's current epoch"
    },
    {
      "code": 6017,
      "name": "snapshotMismatch",
      "msg": "Snapshot belongs to a different refinery"
    },
    {
      "code": 6018,
      "name": "snapshotStaleEpoch",
      "msg": "Snapshot is from a stale epoch"
    },
    {
      "code": 6019,
      "name": "emptySnapshot",
      "msg": "Snapshot must include at least one holder and positive balance"
    },
    {
      "code": 6020,
      "name": "merkleProofInvalid",
      "msg": "Merkle proof did not verify against snapshot root"
    },
    {
      "code": 6021,
      "name": "balanceMustBePositive",
      "msg": "Balance at snapshot must be positive"
    },
    {
      "code": 6022,
      "name": "claimWindowClosed",
      "msg": "Claim window has closed"
    },
    {
      "code": 6023,
      "name": "poolEmpty",
      "msg": "Refinery pool is empty"
    },
    {
      "code": 6024,
      "name": "unsupportedToken2022Extension",
      "msg": "Token-2022 extension not supported by this program in v1"
    },
    {
      "code": 6025,
      "name": "numericalOverflow",
      "msg": "Numerical overflow"
    },
    {
      "code": 6026,
      "name": "poolAccountingDrift",
      "msg": "Pool accounting drifted from escrow ATA balance"
    }
  ],
  "types": [
    {
      "name": "authorityRotated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "which",
            "type": "u8"
          },
          {
            "name": "previous",
            "type": "pubkey"
          },
          {
            "name": "current",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "claimArgs",
      "docs": [
        "Args for `claim`. Holder proves they were eligible at snapshot",
        "time (merkle proof against `Snapshot.merkle_root`) and receives",
        "their pro-rata share of the remaining pool, capped per the",
        "refinery's `per_claim_cap_bps`.",
        "",
        "The `merkle_proof` is the sequence of sibling hashes from the",
        "holder's leaf up to (but not including) the root. Sorted-pair",
        "hashing means no position bits are needed."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "snapshotIndex",
            "type": "u32"
          },
          {
            "name": "balanceAtSnapshot",
            "type": "u64"
          },
          {
            "name": "merkleProof",
            "type": {
              "vec": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "claimMade",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "refinery",
            "type": "pubkey"
          },
          {
            "name": "holder",
            "type": "pubkey"
          },
          {
            "name": "snapshotIndex",
            "type": "u32"
          },
          {
            "name": "balanceAtSnapshot",
            "type": "u64"
          },
          {
            "name": "amountClaimed",
            "type": "u64"
          },
          {
            "name": "poolRemainingAfter",
            "type": "u64"
          },
          {
            "name": "claimedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "claimReceipt",
      "docs": [
        "Per-claim account. PDA seeds:",
        "`[b\"claim\", refinery, holder, snapshot_index_le_u32]`.",
        "",
        "Existence of the PDA = \"this holder claimed this snapshot.\" A",
        "re-claim attempt fails on `init` because the PDA already exists.",
        "This is the program's replay protection.",
        "",
        "Rent is paid by the holder at claim time (~0.0015 SOL). A future",
        "`close_claim_receipt` sweep instruction can recover rent after",
        "the refinery is closed."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "refinery",
            "type": "pubkey"
          },
          {
            "name": "holder",
            "type": "pubkey"
          },
          {
            "name": "snapshotIndex",
            "type": "u32"
          },
          {
            "name": "balanceAtSnapshot",
            "type": "u64"
          },
          {
            "name": "amountClaimed",
            "docs": [
              "Pre-transfer-fee amount. Token-2022 transfer fees may have",
              "reduced what the holder actually received in their ATA — the",
              "indexer compares against the deposited token's transfer-fee",
              "config to compute the post-fee delta if needed."
            ],
            "type": "u64"
          },
          {
            "name": "claimedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "depositArgs",
      "docs": [
        "Args for `deposit` (top-up). Operator adds more tokens to an",
        "existing refinery's pool. The 1% deposit fee is taken on the",
        "top-up amount, same as at launch — the platform's economic",
        "model is consistent across init and top-ups."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "epochAdvanced",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "refinery",
            "type": "pubkey"
          },
          {
            "name": "newEpoch",
            "type": "u32"
          },
          {
            "name": "claimWindowEnd",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "initRefineryArgs",
      "docs": [
        "Args for `init_refinery`. The operator picks every distribution",
        "parameter; the program enforces only the structural bounds",
        "(positivity, range checks). Sybil-config defaults are tracked",
        "off-chain in the indexer because they don't affect on-chain",
        "math — the merkle root the snapshot authority publishes already",
        "reflects sybil-filtered eligibility.",
        "",
        "`verified_deployer` is *not* an arg — the program computes it",
        "on-chain from `mint.mint_authority == Some(operator)`."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poolInitial",
            "type": "u64"
          },
          {
            "name": "claimRateBasis",
            "type": "u64"
          },
          {
            "name": "perClaimCapBps",
            "type": "u16"
          },
          {
            "name": "poolEmptyStrategy",
            "type": {
              "defined": {
                "name": "poolEmptyStrategy"
              }
            }
          },
          {
            "name": "snapshotStrategy",
            "type": {
              "defined": {
                "name": "snapshotStrategy"
              }
            }
          },
          {
            "name": "claimWindowSeconds",
            "docs": [
              "0 = open-ended (operator must call `close_refinery` to exit).",
              "Otherwise must be >= MIN_CLAIM_WINDOW_SECONDS."
            ],
            "type": "i64"
          },
          {
            "name": "freezeAcknowledged",
            "docs": [
              "Operator must set true if the mint's `freeze_authority` is",
              "active. Acknowledges that claims may be frozen at any time."
            ],
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "initTreasuryArgs",
      "docs": [
        "Args for `init_treasury`. The admin signer (verified to equal",
        "the program's BPF Loader Upgradeable upgrade authority) sets:",
        "- the snapshot authority (off-chain indexer signing key)",
        "- the pause authority (Squads-derived PDA address)",
        "- the SOL fee receiver (treasury wallet)",
        "- the fee schedule (launch / claim / deposit fees)"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "snapshotAuthority",
            "type": "pubkey"
          },
          {
            "name": "pauseAuthority",
            "type": "pubkey"
          },
          {
            "name": "feeReceiverSol",
            "type": "pubkey"
          },
          {
            "name": "launchFeeLamports",
            "type": "u64"
          },
          {
            "name": "claimFeeLamports",
            "type": "u64"
          },
          {
            "name": "depositFeeBps",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "operatorWithdraw",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "refinery",
            "type": "pubkey"
          },
          {
            "name": "operator",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "poolRemainingAfter",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "platformPauseToggled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "by",
            "type": "pubkey"
          },
          {
            "name": "nowPaused",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "poolEmptyStrategy",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "proRata"
          },
          {
            "name": "fcfs"
          }
        ]
      }
    },
    {
      "name": "refinery",
      "docs": [
        "Per-refinery account. PDA seeds: `[b\"refinery\", token_mint, operator]`.",
        "Multiple refineries per mint are allowed; the operator key",
        "disambiguates."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "operator",
            "type": "pubkey"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "escrowAta",
            "type": "pubkey"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "claimWindowEnd",
            "docs": [
              "Unix timestamp when claim window closes. 0 = open-ended."
            ],
            "type": "i64"
          },
          {
            "name": "lastStateChange",
            "docs": [
              "Updated on close / pause / unpause / epoch advance —",
              "used for cooldown calcs."
            ],
            "type": "i64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "refineryStatus"
              }
            }
          },
          {
            "name": "poolInitial",
            "type": "u64"
          },
          {
            "name": "poolTotalDeposited",
            "type": "u64"
          },
          {
            "name": "poolRemaining",
            "type": "u64"
          },
          {
            "name": "poolTotalClaimed",
            "type": "u64"
          },
          {
            "name": "holdersClaimed",
            "type": "u32"
          },
          {
            "name": "epoch",
            "type": "u32"
          },
          {
            "name": "currentSnapshotIndex",
            "type": "u32"
          },
          {
            "name": "claimRateBasis",
            "type": "u64"
          },
          {
            "name": "perClaimCapBps",
            "type": "u16"
          },
          {
            "name": "poolEmptyStrategy",
            "type": {
              "defined": {
                "name": "poolEmptyStrategy"
              }
            }
          },
          {
            "name": "snapshotStrategy",
            "type": {
              "defined": {
                "name": "snapshotStrategy"
              }
            }
          },
          {
            "name": "verifiedDeployer",
            "type": "bool"
          },
          {
            "name": "verifiedCto",
            "type": "bool"
          },
          {
            "name": "freezeAcknowledged",
            "type": "bool"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "refineryClosed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "refinery",
            "type": "pubkey"
          },
          {
            "name": "operator",
            "type": "pubkey"
          },
          {
            "name": "refundAmount",
            "type": "u64"
          },
          {
            "name": "closedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "refineryDeposit",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "refinery",
            "type": "pubkey"
          },
          {
            "name": "operator",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "depositFeePaid",
            "type": "u64"
          },
          {
            "name": "poolRemainingAfter",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "refineryLaunched",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "refinery",
            "type": "pubkey"
          },
          {
            "name": "operator",
            "type": "pubkey"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "poolInitial",
            "type": "u64"
          },
          {
            "name": "claimRateBasis",
            "type": "u64"
          },
          {
            "name": "claimWindowEnd",
            "type": "i64"
          },
          {
            "name": "verifiedDeployer",
            "type": "bool"
          },
          {
            "name": "epoch",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "refineryPauseToggled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "refinery",
            "type": "pubkey"
          },
          {
            "name": "by",
            "type": "pubkey"
          },
          {
            "name": "nowPaused",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "refineryStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "active"
          },
          {
            "name": "operatorPaused"
          },
          {
            "name": "closed"
          }
        ]
      }
    },
    {
      "name": "snapshot",
      "docs": [
        "Per-snapshot account. PDA seeds:",
        "`[b\"snapshot\", refinery, snapshot_index_le_u32]`.",
        "",
        "The on-chain account stores only the merkle root + aggregate",
        "fields. The actual holder list lives off-chain in the indexer.",
        "Holders pass their leaf data + merkle proof when claiming."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "refinery",
            "type": "pubkey"
          },
          {
            "name": "epoch",
            "type": "u32"
          },
          {
            "name": "snapshotIndex",
            "type": "u32"
          },
          {
            "name": "merkleRoot",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "totalEligibleBalance",
            "type": "u64"
          },
          {
            "name": "holderCount",
            "type": "u32"
          },
          {
            "name": "takenAt",
            "type": "i64"
          },
          {
            "name": "submittedBy",
            "docs": [
              "= TreasuryConfig.snapshot_authority at submit time.",
              "Stored so we can detect rotations after the fact."
            ],
            "type": "pubkey"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "snapshotStrategy",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "atLaunch"
          },
          {
            "name": "hourly"
          },
          {
            "name": "daily"
          },
          {
            "name": "weekly"
          },
          {
            "name": "perEpochOnly"
          }
        ]
      }
    },
    {
      "name": "snapshotSubmitted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "refinery",
            "type": "pubkey"
          },
          {
            "name": "snapshot",
            "type": "pubkey"
          },
          {
            "name": "epoch",
            "type": "u32"
          },
          {
            "name": "snapshotIndex",
            "type": "u32"
          },
          {
            "name": "merkleRoot",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "totalEligibleBalance",
            "type": "u64"
          },
          {
            "name": "holderCount",
            "type": "u32"
          },
          {
            "name": "takenAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "submitSnapshotArgs",
      "docs": [
        "Args for `submit_snapshot`. The platform-designated snapshot",
        "authority publishes the merkle root for one refinery's",
        "per-epoch snapshot. The off-chain indexer:",
        "1. Computes the eligible-holder set (post sybil filters).",
        "2. Builds the merkle tree using",
        "`sha256(0x00 || pubkey || balance_le_u64)` leaves.",
        "3. Submits the root via this instruction.",
        "",
        "`epoch` must match `refinery.epoch` — guards against replaying",
        "a snapshot computed for an older configuration."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "merkleRoot",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "totalEligibleBalance",
            "type": "u64"
          },
          {
            "name": "holderCount",
            "type": "u32"
          },
          {
            "name": "epoch",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "treasuryConfig",
      "docs": [
        "Platform-level config singleton. One per program. Initialised via",
        "`init_treasury`. Holds the keys for the snapshot authority,",
        "the Squads-derived pause authority, and the SOL fee receiver,",
        "plus the global fee schedule and the platform pause flag."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "snapshotAuthority",
            "type": "pubkey"
          },
          {
            "name": "pauseAuthority",
            "type": "pubkey"
          },
          {
            "name": "feeReceiverSol",
            "type": "pubkey"
          },
          {
            "name": "treasurySwapPda",
            "type": "pubkey"
          },
          {
            "name": "launchFeeLamports",
            "type": "u64"
          },
          {
            "name": "claimFeeLamports",
            "type": "u64"
          },
          {
            "name": "depositFeeBps",
            "type": "u16"
          },
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "refineriesLaunchedCount",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "treasuryInitialized",
      "docs": [
        "Events emitted by the program. The indexer subscribes to these via",
        "Helius webhooks and writes the decoded payloads into Supabase.",
        "",
        "Event field naming mirrors the on-chain account field names so",
        "indexer code can copy fields by name."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "snapshotAuthority",
            "type": "pubkey"
          },
          {
            "name": "pauseAuthority",
            "type": "pubkey"
          },
          {
            "name": "launchFeeLamports",
            "type": "u64"
          },
          {
            "name": "claimFeeLamports",
            "type": "u64"
          },
          {
            "name": "depositFeeBps",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "updateRateArgs",
      "docs": [
        "Operator updates distribution params. Increments `epoch`. Existing",
        "ClaimReceipt PDAs from prior epochs remain valid (replay",
        "protection still applies); new claims must reference a snapshot",
        "of the new epoch — `submit_snapshot` enforces `args.epoch ==",
        "refinery.epoch`, so any stale snapshot computed against the old",
        "epoch will be rejected.",
        "",
        "Each field is `Option<T>` — operators only specify what they",
        "want to change. Unset fields keep their current value."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newClaimRateBasis",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "newPerClaimCapBps",
            "type": {
              "option": "u16"
            }
          },
          {
            "name": "newPoolEmptyStrategy",
            "type": {
              "option": {
                "defined": {
                  "name": "poolEmptyStrategy"
                }
              }
            }
          },
          {
            "name": "newSnapshotStrategy",
            "type": {
              "option": {
                "defined": {
                  "name": "snapshotStrategy"
                }
              }
            }
          },
          {
            "name": "newClaimWindowExtensionSeconds",
            "docs": [
              "Adds to existing claim_window_end. 0 = no change. Open-ended",
              "refineries (claim_window_end == 0) cannot have their window",
              "extended via this instruction; close_refinery instead."
            ],
            "type": {
              "option": "i64"
            }
          }
        ]
      }
    },
    {
      "name": "verifiedCtoAssigned",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "refinery",
            "type": "pubkey"
          },
          {
            "name": "operator",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "withdrawArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
