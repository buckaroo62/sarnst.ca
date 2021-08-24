module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("assets");

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