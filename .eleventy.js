module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("assets");
    //eleventyConfig.addPassthroughCopy("images");

    return {
        passthroughFileCopy: true,
        markdownTemplateEngine: "njk",
        templateFormats: ["html", "njk", "md", "jpg"],
        dir: {
            input: "src",
            output: "public",
            include: "includes"
        }
    }
};