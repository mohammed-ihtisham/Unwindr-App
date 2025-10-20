import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WelcomeItem from '../WelcomeItem.vue'

describe('WelcomeItem', () => {
  it('renders properly', () => {
    const wrapper = mount(WelcomeItem, {
      slots: {
        icon: '<span>Icon</span>',
        heading: 'Test Heading',
        default: 'Test content'
      }
    })
    expect(wrapper.text()).toContain('Test Heading')
    expect(wrapper.text()).toContain('Test content')
  })
})

