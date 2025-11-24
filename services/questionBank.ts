import { VerilogProblem } from '../types';

export const STATIC_PROBLEMS: VerilogProblem[] = [
  {
    id: 'static-mux2',
    title: '2-to-1 Multiplexer',
    difficulty: 'Easy',
    description: 'Implement a 1-bit 2-to-1 multiplexer using ternary operators or if-else statements.\n\n**Ports:**\n* `a`: Input 0 (1-bit)\n* `b`: Input 1 (1-bit)\n* `sel`: Select signal (1-bit)\n* `out`: Output (1-bit)\n\n**Behavior:**\nIf `sel` is 0, `out` = `a`.\nIf `sel` is 1, `out` = `b`.',
    initialCode: 'module mux2to1 (\n    input a,\n    input b,\n    input sel,\n    output out\n);\n    // Write your code here\n\nendmodule'
  },
  {
    id: 'static-dff',
    title: 'D Flip-Flop (Sync Reset)',
    difficulty: 'Easy',
    description: 'Create a positive edge-triggered D flip-flop with a synchronous active-high reset.\n\n**Ports:**\n* `clk`: Clock input\n* `reset`: Synchronous reset (active high)\n* `d`: Data input\n* `q`: Output',
    initialCode: 'module d_ff_sync (\n    input clk,\n    input reset,\n    input d,\n    output reg q\n);\n    always @(posedge clk) begin\n        // Write your code here\n    end\nendmodule'
  },
  {
    id: 'static-counter',
    title: '4-bit Binary Counter',
    difficulty: 'Easy',
    description: 'Design a 4-bit synchronous up-counter with an active-high synchronous reset. It should wrap around from 15 to 0.\n\n**Ports:**\n* `clk`: Clock\n* `reset`: Synchronous Reset\n* `q`: 4-bit Output',
    initialCode: 'module counter_4bit (\n    input clk,\n    input reset,\n    output reg [3:0] q\n);\n    // Write your code here\nendmodule'
  },
  {
    id: 'static-edgedetect',
    title: 'Rising Edge Detector',
    difficulty: 'Medium',
    description: 'Design a circuit that detects a rising edge on the input signal `in`. The output `tick` should be high for exactly one clock cycle when a 0->1 transition occurs on `in`.\n\n**Ports:**\n* `clk`: Clock\n* `in`: Input signal\n* `tick`: Output pulse',
    initialCode: 'module edge_detector (\n    input clk,\n    input in,\n    output reg tick\n);\n    // Hint: You might need a register to store the previous state of "in"\n\nendmodule'
  },
  {
    id: 'static-shiftreg',
    title: 'Universal Shift Register',
    difficulty: 'Medium',
    description: 'Implement a 4-bit universal shift register with the following modes controlled by `ctrl`:\n\n* `00`: Hold value\n* `01`: Shift Right\n* `10`: Shift Left\n* `11`: Parallel Load\n\n**Ports:**\n* `clk`, `rst`: Clock and Reset\n* `ctrl`: 2-bit Control\n* `d`: 4-bit Parallel Input\n* `q`: 4-bit Output',
    initialCode: 'module shift_reg (\n    input clk,\n    input rst,\n    input [1:0] ctrl,\n    input [3:0] d,\n    output reg [3:0] q\n);\n    // Write logic here\nendmodule'
  },
  {
    id: 'static-fsm1011',
    title: 'Sequence Detector (1011)',
    difficulty: 'Medium',
    description: 'Design a Moore FSM to detect the overlapping sequence "1011".\n\n**Example:**\nInput:  0 1 0 1 1 0 1 1\nOutput: 0 0 0 0 1 0 0 1\n\n**Ports:**\n* `clk`: Clock\n* `reset`: Asynchronous Reset (active high)\n* `in`: Serial input\n* `detected`: Output signal (high when 1011 is detected)',
    initialCode: 'module seq_detect_1011 (\n    input clk,\n    input reset,\n    input in,\n    output reg detected\n);\n    // State encoding\n    localparam S0 = 0, S1 = 1, S10 = 2, S101 = 3, S1011 = 4;\n    reg [2:0] state, next_state;\n\n    // State transition logic\nendmodule'
  },
  {
    id: 'static-priority',
    title: '4-to-2 Priority Encoder',
    difficulty: 'Medium',
    description: 'Design a 4-to-2 priority encoder. If multiple inputs are high, the highest index has priority.\n\n* `in[3]` -> `out` = 3\n* `in[2]` -> `out` = 2\n* `in[1]` -> `out` = 1\n* `in[0]` -> `out` = 0\n* `in` = 0 -> `out` = 0, `valid` = 0\n\n**Ports:**\n* `in`: 4-bit Input\n* `out`: 2-bit Output\n* `valid`: Output valid flag',
    initialCode: 'module priority_enc (\n    input [3:0] in,\n    output reg [1:0] out,\n    output reg valid\n);\n    always @(*) begin\n        // Combinational logic here\n    end\nendmodule'
  },
  {
    id: 'static-clkdiv3',
    title: 'Clock Divider by 3',
    difficulty: 'Hard',
    description: 'Design a clock divider that divides the input clock frequency by 3 with a 50% duty cycle output.\n\n**Ports:**\n* `clk_in`: Input Clock\n* `rst`: Reset\n* `clk_out`: Output Clock (freq = clk_in / 3)',
    initialCode: 'module clk_div3 (\n    input clk_in,\n    input rst,\n    output clk_out\n);\n    // Hint: You may need two counters triggered on opposite edges\nendmodule'
  },
  {
    id: 'static-fifo',
    title: 'Synchronous FIFO',
    difficulty: 'Hard',
    description: 'Implement a synchronous FIFO (First-In-First-Out) with parameterized depth and width. Ensure full and empty flags are handled correctly.\n\n**Parameters:**\n* `DEPTH`: 16\n* `WIDTH`: 8\n\n**Ports:**\n* `clk`, `rst_n`: Clock and Active Low Reset\n* `wr_en`, `rd_en`: Write and Read Enables\n* `data_in`: Input Data\n* `data_out`: Output Data\n* `full`, `empty`: Status flags',
    initialCode: 'module sync_fifo #(\n    parameter DEPTH = 16,\n    parameter WIDTH = 8\n)(\n    input clk,\n    input rst_n,\n    input wr_en,\n    input rd_en,\n    input [WIDTH-1:0] data_in,\n    output reg [WIDTH-1:0] data_out,\n    output wire full,\n    output wire empty\n);\n    // Internal memory declaration\n    // reg [WIDTH-1:0] mem [0:DEPTH-1];\n    \n    // Pointers logic\nendmodule'
  },
  {
    id: 'static-arbiter',
    title: 'Round Robin Arbiter',
    difficulty: 'Hard',
    description: 'Design a 4-agent Round Robin Arbiter. It grants access to one requestor at a time in a circular order.\n\n**Ports:**\n* `clk`, `rst`: Clock and Reset\n* `req`: 4-bit Request vector\n* `grant`: 4-bit Grant vector (one-hot)',
    initialCode: 'module arbiter_rr (\n    input clk,\n    input rst,\n    input [3:0] req,\n    output reg [3:0] grant\n);\n    // Write your arbiter logic\nendmodule'
  }
];