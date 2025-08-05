import axios from 'axios';
import cheerio from 'cheerio';

export const fetchHTML = async (url: string): Promise<string> => {
    try {
        const { data } = await axios.get(url);
        return data;
    } catch (error) {
        throw new Error(`Error fetching the URL: ${url}. ${error.message}`);
    }
};

export const scrapeData = (html: string, selector: string): string[] => {
    const $ = cheerio.load(html);
    const elements = $(selector);
    const results: string[] = [];

    elements.each((index, element) => {
        results.push($(element).text().trim());
    });

    return results;
};