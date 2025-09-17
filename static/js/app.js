// Quote Generator Interactive Features

async function getNewQuote(category = '') {
    const button = document.getElementById('newQuoteBtn');
    const originalText = button.textContent;
    
    // Show loading state
    button.textContent = 'Loading...';
    button.disabled = true;
    
    try {
        const url = category ? 
            `/api/quote?category=${encodeURIComponent(category)}` : 
            '/api/quote';
            
        const response = await fetch(url);
        const quote = await response.json();
        
        // Update quote display
        updateQuoteDisplay(quote);
        
    } catch (error) {
        console.error('Error fetching quote:', error);
        showError('Failed to load new quote. Please try again.');
    } finally {
        // Reset button
        button.textContent = originalText;
        button.disabled = false;
    }
}

function updateQuoteDisplay(quote) {
    // Update quote content
    const quoteText = document.querySelector('blockquote p');
    const quoteAuthor = document.querySelector('blockquote footer');
    
    if (quoteText && quoteAuthor) {
        quoteText.textContent = `"${quote.content}"`;
        quoteAuthor.textContent = `— ${quote.author}`;
        
        // Add subtle animation
        const quoteCard = document.querySelector('.quote-card');
        quoteCard.style.opacity = '0.7';
        setTimeout(() => {
            quoteCard.style.opacity = '1';
        }, 150);
    }
    
    // Update tags if present
    const tagsContainer = document.querySelector('.quote-tags');
    if (tagsContainer && quote.tags) {
        tagsContainer.innerHTML = quote.tags
            .map(tag => `<span class="tag">${tag}</span>`)
            .join('');
    }
}

function shareQuote() {
    const quoteText = document.querySelector('blockquote p').textContent;
    const author = document.querySelector('blockquote footer').textContent;
    const shareText = `${quoteText}\n\n${author}\n\nShared via QuoteWise`;
    
    // Try native share API first
    if (navigator.share) {
        navigator.share({
            title: 'Inspirational Quote',
            text: shareText,
            url: window.location.href
        }).catch(err => console.log('Share failed:', err));
    } else {
        // Fallback to clipboard
        copyToClipboard(shareText);
        showNotification('Quote copied to clipboard!');
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

function showNotification(message) {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-red);
        color: white;
        padding: 1rem;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showError(message) {
    console.error(message);
    showNotification(message);
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);
