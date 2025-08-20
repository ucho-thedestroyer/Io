      class DoomGallery {
        constructor() {
          this.currentIndex = 0;
          this.items = document.querySelectorAll('.gallery-item');
          this.tunnel = document.getElementById('doom-tunnel');
          this.currentItemDisplay = document.getElementById('current-item');
          this.prevBtn = document.getElementById('prev-btn');
          this.nextBtn = document.getElementById('next-btn');
          
          this.init();
        }
        
        init() {
          this.updateDisplay();
          this.bindEvents();
          this.positionItems();
        }
        
        bindEvents() {
          // Keyboard navigation
          document.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowLeft') {
              e.preventDefault();
              this.navigate(-1);
            } else if (e.code === 'ArrowRight') {
              e.preventDefault();
              this.navigate(1);
            }
          });
          
          // Button navigation
          this.prevBtn.addEventListener('click', () => this.navigate(-1));
          this.nextBtn.addEventListener('click', () => this.navigate(1));
          
          // Item click navigation
          this.items.forEach((item, index) => {
            item.addEventListener('click', () => {
              if (index !== this.currentIndex) {
                this.currentIndex = index;
                this.updateDisplay();
              }
            });
          });
        }
        
        navigate(direction) {
          this.currentIndex = (this.currentIndex + direction + this.items.length) % this.items.length;
          this.updateDisplay();
        }
        
        updateDisplay() {
          // Update active item
          this.items.forEach((item, index) => {
            item.classList.toggle('active', index === this.currentIndex);
          });
          
          // Update HUD
          this.currentItemDisplay.textContent = this.currentIndex + 1;
          
          // Move tunnel to center the active item
          this.positionItems();
        }
        
        positionItems() {
          const baseZ = this.currentIndex * 200;
          
          this.items.forEach((item, index) => {
            const relativeIndex = index - this.currentIndex;
            const z = -Math.abs(relativeIndex) * 200;
            const x = Math.sin(relativeIndex * 0.5) * 100;
            const y = Math.cos(relativeIndex * 0.3) * 50;
            const rotateY = relativeIndex * 15;
            
            let left = 50;
            let top = 50;
            
            // Vary positions for more dynamic look
            switch (index) {
              case 0:
                left = 50; top = 50;
                break;
              case 1:
                left = 30; top = 40;
                break;
              case 2:
                left = 70; top = 60;
                break;
              case 3:
                left = 40; top = 30;
                break;
              case 4:
                left = 60; top = 70;
                break;
            }
            
            item.style.left = left + '%';
            item.style.top = top + '%';
            item.style.transform = `translate(-50%, -50%) translateZ(${z}px) translateX(${x}px) translateY(${y}px) rotateY(${rotateY}deg)`;
            
            // Adjust opacity based on distance
            const opacity = Math.max(0.3, 1 - Math.abs(relativeIndex) * 0.2);
            item.style.opacity = opacity;
          });
        }
      }
      
      // Initialize the gallery when the page loads
      document.addEventListener('DOMContentLoaded', () => {
        new DoomGallery();
      });
