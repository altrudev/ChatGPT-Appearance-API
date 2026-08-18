# Proposal: Host-Controlled Appearance API for ChatGPT

## Summary

Expose a narrow, permissioned Appearance API that allows approved themes or plugins to request user-controlled visual personalization without granting arbitrary CSS, DOM, conversation, authentication, or execution authority.

The Safe Appearance Layer repository now includes both a working ChatGPT compatibility extension and an **executable native reference host** demonstrating how the safer host-owned version works in practice.

## Problem

Users can currently obtain deeper personalization only through browser extensions/userscripts with host-page styling authority. That is broader authority than a wallpaper, transparency, or accessibility theme actually needs.

A host-native capability can make the safe path narrower than the workaround.

## Proposed model

```text
User approval
    ↓
Theme declarative capability request
    ↓
Host validation and accessibility policy
    ↓
Host-owned rendering
    ↓
Transition evidence + rollback
```

The provider never receives the ChatGPT DOM or conversation simply because it is allowed to alter presentation.

## Initial capability namespace

- `background.color`
- `background.gradient`
- `background.image`
- `background.blur`
- `surface.conversation.opacity`
- `surface.sidebar.opacity`
- `surface.glass.blur`

No capability in the initial namespace changes functional-control visibility, event handling, authentication UI, message content, or executable behavior.

## Local asset model

For a local background image, ChatGPT can retain the bytes and expose only an opaque handle such as:

```text
asset://local/user-selected-background
```

A theme does not need to receive the image or a network URL. This avoids turning personalization into an implicit tracking or upload channel.

## User-facing permissions

An install/approval surface could state:

**Can**
- change background presentation;
- change approved surface transparency;
- change approved blur/decorative appearance tokens.

**Cannot**
- read conversations because of appearance permission;
- change authentication UI;
- hide or replace ChatGPT controls;
- execute arbitrary CSS/JavaScript;
- load remote tracking assets through the local-only capability.

## Accessibility

The host should remain authoritative for readability. A theme can request surface opacity or blur, but the host may raise opacity, add a scrim, or reject values when required to preserve accessibility.

## Evidence and recovery

The host can record an appearance transition without recording conversation text: theme identifier, requested capabilities, applied/rejected values, policy version, invariant outcomes, and rollback state.

Reset and rollback should always remain host-owned.

## Executable reference

`native-host/` demonstrates the complete native transition path:

1. user capability approval;
2. canonical request validation;
3. opaque local asset handling;
4. host-owned rendering through a fixed presentation-token set;
5. evidence generation;
6. exact rollback;
7. hostile capability rejection.

This allows the security and UX model to be evaluated as running software rather than only as a proposal.

## Core invariant

> **Appearance authority must not imply content authority, interface authority, authentication authority, or execution authority.**
