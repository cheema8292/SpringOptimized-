
function updateHeaderTransparency() {
  const header = document.querySelector('header');
  const firstSection = document.getElementById('MainContent')?.firstElementChild;
  const topSpacer = getComputedStyle(firstSection).getPropertyValue('--topSpacer');
  if (header && firstSection) {
    header.classList.toggle(
      'header-transparent',
      !!firstSection.querySelector('[allow-header-transparent]')
    );
    if (!!firstSection.querySelector('[allow-header-transparent]')) {
      document.querySelector('[header-main-wrapper]').classList.remove('section-spacing')
      header.classList.add('section-spacing');
      document.body.style.setProperty('--headerMargin', `${topSpacer}`);
    } else {
      document.querySelector('[header-main-wrapper]').classList.add('section-spacing')
      header.classList.remove('section-spacing')
    }

  }
}

// call it
updateHeaderTransparency();  