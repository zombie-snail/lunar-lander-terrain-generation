# A Simple Method of Terrain Generation for Lunar Lander

Note: This is an experimental method of generating lunar lander like terrain. There are probably better ways to do this. 

Terrain base shape is generated as the random superposition of trigonometric functions of the form:

![](figures/trig-sum.gif)

![](figures/a-b-set.gif)

 ![a_{i}](figures/ai.gif) and ![b_{i}](figures/bi.gif) are randomly generated terms for each value of ![i](figures/i.gif). The limit of the sum ![n](figures/n.gif) determines how many different variations of base shape are possible, which is given by ![2^2n](figures/2-2n.gif). Further, the product ![ix](figures/ix.gif) is the frequency of the trig function, thus larger values of ![n](figures/n.gif) produce narrower peaks.

 The terrain is then created by sampling the base shape function for a set of $x$ values and can be rendered as a connected set of lines. To make the terrain more natural looking random deviations can be applied to the sampled values to give it a rougher look.

 Try it out here...

 https://zombie-snail.github.io/lunar-lander-terrain-generation/

 # License

 Dont care! Do with it as you please.

