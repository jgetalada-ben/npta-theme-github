/**
 * Exam Selector Functionality
 * Handles the exam selection modal and updates the hidden input for cart properties
 */

class ExamSelector {
  constructor(sectionId) {
    this.sectionId = sectionId;
    this.modal = document.getElementById(`exam-modal-${sectionId}`);
    this.openBtn = document.getElementById(`exam-selector-btn-${sectionId}`);
    this.closeBtn = this.modal?.querySelector('.exam-modal-close');
    this.cancelBtn = this.modal?.querySelector('.exam-modal-cancel');
    this.confirmBtn = this.modal?.querySelector('.exam-modal-confirm');
    this.examOptions = this.modal?.querySelectorAll('.exam-option');
    this.hiddenInput = document.getElementById(`exam-option-input-${sectionId}`);
    this.selectedText = document.getElementById(`exam-selected-text-${sectionId}`);

    this.selectedExam = 'NASM Certified Personal Trainer (NCCA Accredited Certification Exam)';

    this.init();
  }

  init() {
    if (!this.modal || !this.openBtn) return;

    // Open modal
    this.openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.openModal();
    });

    // Close modal
    this.closeBtn?.addEventListener('click', () => this.closeModal());
    this.cancelBtn?.addEventListener('click', () => this.closeModal());

    // Close on overlay click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    // Handle exam option selection
    this.examOptions?.forEach(option => {
      option.addEventListener('click', () => {
        this.selectExam(option);
      });
    });

    // Confirm selection
    this.confirmBtn?.addEventListener('click', () => {
      this.confirmSelection();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });
  }

  openModal() {
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  selectExam(option) {
    // Remove selected class from all options
    this.examOptions.forEach(opt => opt.classList.remove('selected'));

    // Add selected class to clicked option
    option.classList.add('selected');

    // Store the selected exam value
    this.selectedExam = option.getAttribute('data-exam-value');
  }

  confirmSelection() {
    // Update hidden input value
    if (this.hiddenInput) {
      this.hiddenInput.value = this.selectedExam;
    }

    // Update selected text display
    if (this.selectedText) {
      const shortText = this.selectedExam.includes('NCCA')
        ? 'NASM Certified Personal Trainer (NCCA Accredited)'
        : 'NASM Personal Trainer Certificate (Non-Proctored)';

      this.selectedText.querySelector('span').textContent = shortText;
    }

    // Close modal
    this.closeModal();
  }
}

// Initialize exam selector when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Find all exam selector instances on the page
  const examButtons = document.querySelectorAll('[id^="exam-selector-btn-"]');

  examButtons.forEach(button => {
    const sectionId = button.id.replace('exam-selector-btn-', '');
    new ExamSelector(sectionId);
  });
});
