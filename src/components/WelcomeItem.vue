<template>
  <div class="item">
    <div class="icon-wrapper">
      <slot name="icon"></slot>
    </div>
    <div class="details">
      <h3>
        <slot name="heading"></slot>
      </h3>
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: all 0.3s;
}

.item:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.icon-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.details {
  flex: 1;
}

h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-heading);
}

@media (max-width: 768px) {
  .item {
    flex-direction: column;
    text-align: center;
  }
}
</style>

